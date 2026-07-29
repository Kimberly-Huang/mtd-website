import crypto from 'node:crypto';

export const COOKIE_NAME = 'mtd_session';
const SESSION_SECONDS = 12 * 60 * 60;
const REMEMBER_SECONDS = 7 * 24 * 60 * 60;

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function getAuthConfig(env = process.env) {
  const username = (env.MTD_AUTH_USERNAME || '').trim();
  const password = env.MTD_AUTH_PASSWORD || '';
  const secret = env.MTD_AUTH_SECRET || '';
  if (!username || password.length < 10 || secret.length < 32) return null;
  return { username, password, secret };
}

export function credentialsValid(username, password, env = process.env) {
  const config = getAuthConfig(env);
  if (!config) return false;
  return safeEqual((username || '').trim(), config.username) &&
    safeEqual(password || '', config.password);
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionCookie(username, remember = false, env = process.env, now = Date.now()) {
  const config = getAuthConfig(env);
  if (!config) throw new Error('Authentication is not configured');
  const ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  const claims = {
    u: username,
    exp: Math.floor(now / 1000) + ttl,
    v: 1,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const token = `${payload}.${sign(payload, config.secret)}`;
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ];
  if (remember) parts.push(`Max-Age=${ttl}`);
  return parts.join('; ');
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request) {
  const helperValue = request?.cookies?.[COOKIE_NAME];
  if (helperValue) return helperValue;
  const headers = request?.headers;
  const raw = typeof headers?.get === 'function'
    ? headers.get('cookie') || ''
    : headers?.cookie || headers?.Cookie || '';
  return raw
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
}

export function authenticatedUser(request, env = process.env, now = Date.now()) {
  const config = getAuthConfig(env);
  const token = readCookie(request);
  if (!config || !token) return null;
  try {
    const [payload, signature] = token.split('.', 2);
    if (!payload || !signature) return null;
    const expected = sign(payload, config.secret);
    if (!safeEqual(signature, expected)) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.u !== config.username || claims.v !== 1) return null;
    if (Number(claims.exp) <= Math.floor(now / 1000)) return null;
    return claims.u;
  } catch {
    return null;
  }
}
