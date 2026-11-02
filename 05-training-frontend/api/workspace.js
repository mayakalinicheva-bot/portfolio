import { authorized, unavailable, json, read, write, fail } from '../lib/cloud.js';

const path = 'discovery/workspace-v2.json';
const kinds = ['matrix', 'documents', 'hypotheses', 'research', 'decisions', 'entities', 'tasks'];

function valid(state) {
  return state && state.version === 2 && kinds.every(kind => Array.isArray(state[kind]) && state[kind].length <= 10000)
    && state.crud && typeof state.crud === 'object' && !Array.isArray(state.crud)
    && Array.isArray(state.reportItems);
}

async function handler(request) {
  if (!authorized(request)) return json({ error: 'Неверный ключ синхронизации' }, 401);
  if (unavailable()) return json({ error: 'Облачная синхронизация ещё не настроена' }, 503);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Метод не поддерживается' }, 405);
  try {
    const current = await read('discovery/workspace-v2.json');
    if (request.method === 'GET') return json(current.value || { revision: 0, state: null });
    const body = await request.text();
    if (body.length > 4_000_000) return json({ error: 'Рабочее пространство слишком велико для сохранения' }, 413);
    const incoming = JSON.parse(body);
    if (!valid(incoming.state) || !Number.isInteger(incoming.revision) || incoming.revision < 0) return json({ error: 'Некорректное рабочее пространство' }, 400);
    const revision = current.value?.revision || 0;
    if (incoming.revision !== revision) return json({ error: 'Облачная копия изменилась на другом устройстве. Скачай текущую копию и обнови страницу.' }, 409);
    const savedAt = new Date().toISOString();
    await write(path, { revision: revision + 1, savedAt, state: incoming.state }, current.etag);
    return json({ revision: revision + 1, savedAt });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'Некорректный JSON' }, 400);
    return fail(error);
  }
}

export async function GET(request) { return handler(request); }
export async function POST(request) { return handler(request); }
