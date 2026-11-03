import { randomBytes } from 'node:crypto';
import { write } from '../../lib/cloud.js';
import { ORIGIN, RESOURCE, CLIENT_ID, REDIRECT_URI, digest, equal, oauthSecret, oauthJson, validResource, validScope } from '../../lib/oauth.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function params(source) {
  const get = key => String(source.get(key) || '');
  const value = Object.fromEntries(['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'scope', 'state', 'resource'].map(key => [key, get(key)]));
  if (value.response_type !== 'code' || value.client_id !== CLIENT_ID || value.redirect_uri !== REDIRECT_URI || value.code_challenge_method !== 'S256'
    || !/^[A-Za-z0-9_-]{43,128}$/.test(value.code_challenge) || !validScope(value.scope) || !validResource(value.resource) || !value.state || value.state.length > 2048) return null;
  return value;
}

export function GET(request) {
  if (!oauthSecret()) return oauthJson({ error: 'server_error' }, 503);
  const input = params(new URL(request.url).searchParams);
  if (!input) return oauthJson({ error: 'invalid_request' }, 400);
  const hidden = Object.entries(input).map(([key, value]) => `<input type="hidden" name="${key}" value="${escape(value)}">`).join('');
  const body = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio Discovery — доступ ChatGPT</title><style>body{font:16px system-ui,sans-serif;background:#f5f3ee;color:#242924;min-height:100vh;display:grid;place-items:center;margin:0;padding:24px;box-sizing:border-box}main{max-width:460px;background:white;padding:32px;border-radius:20px;box-shadow:0 18px 60px #20302818}h1{font-size:27px;margin:0 0 12px}p{line-height:1.5;color:#59635a}label{display:block;margin:22px 0 8px;font-weight:600}input[type=password]{width:100%;box-sizing:border-box;padding:13px;border:1px solid #b8c1b9;border-radius:10px;font:inherit}button{margin-top:18px;padding:13px 18px;border:0;border-radius:10px;background:#254c3b;color:white;font:inherit;cursor:pointer}</style></head><body><main><h1>Подключить ChatGPT</h1><p>Личный Plugin получит доступ к чтению Discovery и сможет отправлять предложения во входящие. Подтверждённые записи останутся под вашим контролем.</p><form method="post" action="/oauth/authorize">${hidden}<label for="key">Ключ Discovery</label><input id="key" name="key" type="password" autocomplete="off" required><button type="submit">Разрешить доступ</button></form></main></body></html>`;
  return new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://chatgpt.com; base-uri 'none'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff' } });
}

export async function POST(request) {
  if (!oauthSecret()) return oauthJson({ error: 'server_error' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 16000) return oauthJson({ error: 'invalid_request' }, 413);
  try {
    const form = await request.formData();
    const input = params(form);
    if (!input) return oauthJson({ error: 'invalid_request' }, 400);
    if (!equal(String(form.get('key') || ''), oauthSecret())) return new Response('Неверный ключ Discovery', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
    const code = randomBytes(32).toString('base64url');
    await write(`oauth/codes/${digest(code)}.json`, { client_id: input.client_id, redirect_uri: input.redirect_uri, challenge: input.code_challenge, scope: input.scope, resource: input.resource, exp: Date.now() + 300000, used: false }, null);
    const redirect = new URL(REDIRECT_URI);
    redirect.searchParams.set('code', code);
    redirect.searchParams.set('state', input.state);
    redirect.searchParams.set('iss', ORIGIN);
    return Response.redirect(redirect, 302);
  } catch (error) {
    console.error('Discovery OAuth authorization error:', error);
    return oauthJson({ error: 'server_error' }, 503);
  }
}
