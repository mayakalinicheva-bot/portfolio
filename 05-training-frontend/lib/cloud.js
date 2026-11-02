import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';

const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

export function authorized(request) {
  const secret = process.env.DISCOVERY_SYNC_KEY;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!secret || !provided) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unavailable() {
  return !process.env.DISCOVERY_SYNC_KEY || !(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function read(path) {
  const result = await get(path, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return { value: null, etag: null };
  const value = await new Response(result.stream).json();
  return { value, etag: result.blob.etag };
}

export async function write(path, value, etag) {
  try {
    const result = await put(path, JSON.stringify(value), {
      access: 'private',
      contentType: 'application/json',
      ...(etag ? { allowOverwrite: true, ifMatch: etag } : {}),
    });
    return result.etag;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || /already exists|precondition/i.test(String(error.message))) {
      const conflict = new Error('Данные изменились в другой вкладке или в GPT. Обнови облачную копию.');
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
}

export function fail(error) {
  console.error('Discovery cloud error:', error);
  return json({ error: error.status === 409 ? error.message : 'Облачное хранилище временно недоступно' }, error.status || 503);
}
