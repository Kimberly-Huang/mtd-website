import {
  authenticatedUser,
  clearSessionCookie,
  createSessionCookie,
  credentialsValid,
  getAuthConfig,
} from '../lib/auth.js';

function json(response, status, body, headers = {}) {
  response.status(status);
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value));
  response.json(body);
}

function requestBody(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body); } catch { return {}; }
  }
  return {};
}

export default function handler(request, response) {
  const action = String(request.query?.action || 'session');

  if (request.method === 'GET' && action === 'session') {
    const username = authenticatedUser(request);
    return json(response, 200, {
      authenticated: Boolean(username),
      username: username || null,
      configured: Boolean(getAuthConfig()),
    });
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return json(response, 405, { error: 'Method not allowed' });
  }

  if (action === 'logout') {
    return json(response, 200, { authenticated: false }, {
      'Set-Cookie': clearSessionCookie(),
    });
  }

  if (action !== 'login') return json(response, 404, { error: 'Unknown action' });
  if (!getAuthConfig()) {
    return json(response, 503, { error: 'Sign-in is not configured for this deployment.' });
  }

  const body = requestBody(request);
  const username = String(body.username || '');
  const password = String(body.password || '');
  if (!credentialsValid(username, password)) {
    return json(response, 401, { error: 'Invalid username or password.' });
  }

  return json(response, 200, { authenticated: true, username: username.trim() }, {
    'Set-Cookie': createSessionCookie(username.trim(), body.remember === true),
  });
}
