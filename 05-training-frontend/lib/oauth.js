import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ORIGIN = 'https://portfolio-discovery.vercel.app';
export const RESOURCE = `${ORIGIN}/mcp`;
export const CLIENT_ID = 'https://chatgpt.com/oauth/client.json';
export const REDIRECT_URI = 'https://chatgpt.com/connector_platform_oauth_redirect';
export const SCOPES = ['discovery:read', 'discovery:write'];

export function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function digest(value) {
  return createHash('sha256').update(value).digest('base64url');
}

export function oauthSecret() {
  return process.env.DISCOVERY_SYNC_KEY || '';
}

export function sign(payload) {
  if (!oauthSecret()) throw new Error('Discovery OAuth is not configured');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = createHmac('sha256', oauthSecret()).update(`discovery-oauth-v1.${body}`).digest('base64url');
  return `${body}.${mac}`;
}

export function verify(token, type) {
  if (!oauthSecret()) return null;
  if (typeof token !== 'string' || token.length > 10000) return null;
  const [body, mac, extra] = token.split('.');
  if (!body || !mac || extra) return null;
  const expected = createHmac('sha256', oauthSecret()).update(`discovery-oauth-v1.${body}`).digest('base64url');
  if (!equal(mac, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (claims.typ !== type || claims.iss !== ORIGIN || claims.aud !== RESOURCE || claims.client_id !== CLIENT_ID) return null;
    if (!Number.isInteger(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch { return null; }
}

export function access(request, scope) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const claims = verify(token, 'access');
  return claims && String(claims.scope || '').split(' ').includes(scope) ? claims : null;
}

export function validResource(value) {
  return value === RESOURCE;
}

export function validScope(value) {
  const requested = String(value || '').split(/\s+/).filter(Boolean);
  return requested.length > 0 && requested.every(scope => SCOPES.includes(scope));
}

export function challenge(scope) {
  return `Bearer resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource", scope="${scope}", error="invalid_token", error_description="Connect Portfolio Discovery"`;
}

export function oauthJson(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders } });
}
