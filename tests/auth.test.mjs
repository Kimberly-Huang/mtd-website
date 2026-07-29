import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COOKIE_NAME,
  authenticatedUser,
  clearSessionCookie,
  createSessionCookie,
  credentialsValid,
  getAuthConfig,
} from '../lib/auth.js';
import authHandler from '../api/auth.js';
import siteHandler from '../api/site.js';

const env = {
  MTD_AUTH_USERNAME: 'reviewer',
  MTD_AUTH_PASSWORD: 'strong-test-password',
  MTD_AUTH_SECRET: 'test-secret-with-at-least-thirty-two-characters',
};

test('requires a complete, sufficiently strong server configuration', () => {
  assert.deepEqual(getAuthConfig(env), {
    username: env.MTD_AUTH_USERNAME,
    password: env.MTD_AUTH_PASSWORD,
    secret: env.MTD_AUTH_SECRET,
  });
  assert.equal(getAuthConfig({ ...env, MTD_AUTH_PASSWORD: 'short' }), null);
  assert.equal(getAuthConfig({ ...env, MTD_AUTH_SECRET: 'too-short' }), null);
});

test('validates credentials without coercing values', () => {
  assert.equal(credentialsValid('reviewer', 'strong-test-password', env), true);
  assert.equal(credentialsValid('Reviewer', 'strong-test-password', env), false);
  assert.equal(credentialsValid('reviewer', 'wrong-password', env), false);
});

test('creates and verifies a signed HttpOnly cookie', () => {
  const now = Date.UTC(2026, 6, 29, 12);
  const cookie = createSessionCookie('reviewer', true, env, now);
  assert.match(cookie, new RegExp(`^${COOKIE_NAME}=`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  const token = cookie.split(';', 1)[0];
  assert.equal(authenticatedUser({ headers: { cookie: token } }, env, now + 1000), 'reviewer');
});

test('rejects tampered and expired cookies', () => {
  const now = Date.UTC(2026, 6, 29, 12);
  const cookie = createSessionCookie('reviewer', false, env, now).split(';', 1)[0];
  assert.equal(authenticatedUser({ headers: { cookie: `${cookie}x` } }, env, now + 1000), null);
  assert.equal(authenticatedUser({ headers: { cookie } }, env, now + 13 * 60 * 60 * 1000), null);
});

test('clears the session cookie immediately', () => {
  assert.match(clearSessionCookie(), new RegExp(`^${COOKIE_NAME}=;`));
  assert.match(clearSessionCookie(), /Max-Age=0/);
});

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(value) { this.body = JSON.stringify(value); return this; },
    end(value = '') { this.body = value; return this; },
  };
}

test('login endpoint rejects bad credentials and issues a server cookie for valid credentials', () => {
  const previous = {
    username: process.env.MTD_AUTH_USERNAME,
    password: process.env.MTD_AUTH_PASSWORD,
    secret: process.env.MTD_AUTH_SECRET,
  };
  Object.assign(process.env, env);
  try {
    const denied = mockResponse();
    authHandler({
      method: 'POST',
      query: { action: 'login' },
      body: { username: 'reviewer', password: 'wrong-password' },
      headers: {},
    }, denied);
    assert.equal(denied.statusCode, 401);

    const allowed = mockResponse();
    authHandler({
      method: 'POST',
      query: { action: 'login' },
      body: { username: 'reviewer', password: 'strong-test-password', remember: true },
      headers: {},
    }, allowed);
    assert.equal(allowed.statusCode, 200);
    assert.match(allowed.headers['Set-Cookie'], new RegExp(`^${COOKIE_NAME}=`));
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const envKey = `MTD_AUTH_${key.toUpperCase()}`;
      if (value === undefined) delete process.env[envKey];
      else process.env[envKey] = value;
    }
  }
});

test('site endpoint returns login HTML without a session and dashboard HTML with one', () => {
  const previous = {
    username: process.env.MTD_AUTH_USERNAME,
    password: process.env.MTD_AUTH_PASSWORD,
    secret: process.env.MTD_AUTH_SECRET,
  };
  Object.assign(process.env, env);
  try {
    const anonymous = mockResponse();
    siteHandler({ method: 'GET', headers: {} }, anonymous);
    assert.match(anonymous.body, /Sign in to continue/);
    assert.doesNotMatch(anonymous.body, /The story in five decisions/);

    const cookie = createSessionCookie('reviewer', false, env).split(';', 1)[0];
    const signedIn = mockResponse();
    siteHandler({ method: 'GET', headers: { cookie } }, signedIn);
    assert.match(signedIn.body, /The story in five decisions/);
    assert.doesNotMatch(signedIn.body, /Sign in to continue/);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const envKey = `MTD_AUTH_${key.toUpperCase()}`;
      if (value === undefined) delete process.env[envKey];
      else process.env[envKey] = value;
    }
  }
});
