import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authenticatedUser } from '../lib/auth.js';

const directory = path.dirname(fileURLToPath(import.meta.url));
const dashboardPath = path.join(directory, '..', 'private', 'dashboard.html');
const loginPath = path.join(directory, '..', 'private', 'login.html');

export default function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    return response.status(405).end('Method not allowed');
  }

  const signedIn = Boolean(authenticatedUser(request));
  const html = fs.readFileSync(signedIn ? dashboardPath : loginPath, 'utf8');
  response.status(200);
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Vary', 'Cookie');
  if (request.method === 'HEAD') return response.end();
  return response.end(html);
}
