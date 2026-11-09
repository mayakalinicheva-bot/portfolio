import { ORIGIN } from '../lib/oauth.js';

const expectedSha256 = 'ce5f5f1de9872d5415fcf48cd8ae9db21e7a039cf9f122472b5a207fc1488b01';

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request) {
  try {
    const raw = await request.text();
    if (!raw || raw.length > 4_000_000) return response({ error: 'Некорректный размер набора' }, 413);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const actual = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (actual !== expectedSha256) return response({ error: 'Набор не соответствует проверенной ревизии' }, 403);
    const data = JSON.parse(raw);
    const result = await fetch(`${ORIGIN}/api/research-interviews`, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.DISCOVERY_SYNC_KEY || ''}`, 'content-type': 'application/json' },
      body: JSON.stringify({ revision: 0, data }),
    });
    return new Response(await result.text(), { status: result.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof SyntaxError) return response({ error: 'Некорректный JSON' }, 400);
    console.error('Research bootstrap error:', error);
    return response({ error: 'Импорт временно недоступен' }, 500);
  }
}

export function GET() {
  return response({ error: 'Метод не поддерживается' }, 405);
}
