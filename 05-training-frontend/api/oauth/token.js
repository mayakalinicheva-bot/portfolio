import { randomBytes } from 'node:crypto';
import { read, write } from '../../lib/cloud.js';
import { ORIGIN, RESOURCE, CLIENT_ID, REDIRECT_URI, digest, equal, oauthSecret, oauthJson, sign, validResource } from '../../lib/oauth.js';

const seconds = () => Math.floor(Date.now() / 1000);
const invalid = () => oauthJson({ error: 'invalid_grant' }, 400);

async function mint(scope) {
  const access_token = sign({ typ: 'access', iss: ORIGIN, aud: RESOURCE, client_id: CLIENT_ID, scope, iat: seconds(), exp: seconds() + 3600 });
  const refresh_token = randomBytes(32).toString('base64url');
  await write(`oauth/refresh/${digest(refresh_token)}.json`, { client_id: CLIENT_ID, scope, resource: RESOURCE, exp: Date.now() + 30 * 86400000, used: false }, null);
  return oauthJson({ access_token, refresh_token, token_type: 'Bearer', expires_in: 3600, scope });
}

export async function POST(request) {
  if (!oauthSecret()) return oauthJson({ error: 'server_error' }, 503);
  try {
    const raw = await request.text();
    if (raw.length > 16000) return oauthJson({ error: 'invalid_request' }, 413);
    const data = new URLSearchParams(raw);
    if (data.get('client_id') !== CLIENT_ID) return oauthJson({ error: 'invalid_client' }, 401);
    if (data.has('resource') && !validResource(data.get('resource'))) return oauthJson({ error: 'invalid_target' }, 400);
    if (data.get('grant_type') === 'authorization_code') {
      const code = data.get('code') || '', verifier = data.get('code_verifier') || '';
      if (!/^[A-Za-z0-9_-]{43,128}$/.test(code) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || data.get('redirect_uri') !== REDIRECT_URI) return invalid();
      const current = await read(`oauth/codes/${digest(code)}.json`);
      const saved = current.value;
      if (!saved || saved.used || saved.exp <= Date.now() || saved.client_id !== CLIENT_ID || saved.redirect_uri !== REDIRECT_URI || saved.resource !== RESOURCE || !equal(saved.challenge, digest(verifier))) return invalid();
      await write(`oauth/codes/${digest(code)}.json`, { ...saved, used: true }, current.etag);
      return mint(saved.scope);
    }
    if (data.get('grant_type') === 'refresh_token') {
      const token = data.get('refresh_token') || '';
      if (!/^[A-Za-z0-9_-]{43,128}$/.test(token)) return invalid();
      const current = await read(`oauth/refresh/${digest(token)}.json`);
      const saved = current.value;
      if (!saved || saved.used || saved.exp <= Date.now() || saved.client_id !== CLIENT_ID || saved.resource !== RESOURCE) return invalid();
      await write(`oauth/refresh/${digest(token)}.json`, { ...saved, used: true }, current.etag);
      return mint(saved.scope);
    }
    return oauthJson({ error: 'unsupported_grant_type' }, 400);
  } catch (error) {
    console.error('Discovery OAuth token error:', error);
    return oauthJson({ error: error.status === 409 ? 'invalid_grant' : 'server_error' }, error.status === 409 ? 400 : 503);
  }
}
