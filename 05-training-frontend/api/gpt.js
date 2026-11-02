import { randomUUID } from 'node:crypto';
import { authorized, unavailable, json, read, write, fail } from '../lib/cloud.js';

const inboxPath = 'discovery/gpt-inbox-v1.json';
const allowedTypes = new Set(['document', 'hypothesis', 'research', 'decision', 'entity', 'requirement', 'task']);
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';

function summary(state) {
  if (!state) return { message: 'Облачное рабочее пространство пока пусто.' };
  const short = (kind, fields) => (state[kind] || []).filter(row => !row.archived).map(row => Object.fromEntries(fields.map(field => [field, clean(row[field], field === 'body' ? 12000 : 500)])));
  const scope = (state.documents || []).find(row => row.source === '01-discovery/project-scope.md');
  const report = state.reportItems || [];
  return {
    updatedAt: state.updatedAt || null,
    projectScope: scope ? { title: scope.title, body: clean(scope.body, 18000) } : null,
    reportItems: report,
    documents: short('documents', ['id', 'title', 'category', 'status', 'source']),
    hypotheses: short('hypotheses', ['id', 'title', 'status', 'assumption', 'evidence']),
    entities: short('entities', ['id', 'title', 'status', 'description']),
    decisions: short('decisions', ['id', 'title', 'status', 'rationale']),
    requirements: (state.matrix || []).filter(row => !row.archived).map(row => ({ id: clean(row.A, 50), block: clean(row.B, 100), title: clean(row.C, 200), status: clean(row.N, 120), questions: clean(row.P, 300) })),
  };
}

async function handler(request) {
  if (unavailable()) return json({ error: 'Облачная синхронизация ещё не настроена' }, 503);
  if (!authorized(request)) return json({ error: 'Неверный ключ синхронизации' }, 401);
  if (!['GET', 'POST', 'PATCH'].includes(request.method)) return json({ error: 'Метод не поддерживается' }, 405);
  try {
    if (request.method === 'GET') {
      const [workspace, inbox] = await Promise.all([read('discovery/workspace-v2.json'), read(inboxPath)]);
      return json({ context: summary(workspace.value?.state), proposals: (inbox.value?.items || []).filter(item => item.status === 'pending').slice(0, 100) });
    }
    const body = await request.text();
    if (body.length > 16_000) return json({ error: 'Предложение слишком велико' }, 413);
    const input = JSON.parse(body);
    if (request.method === 'PATCH') {
      if (typeof input.id !== 'string' || !['applied', 'dismissed'].includes(input.status)) return json({ error: 'Некорректное действие' }, 400);
      const current = await read(inboxPath);
      const items = current.value?.items || [];
      const found = items.find(item => item.id === input.id);
      if (!found) return json({ error: 'Предложение не найдено' }, 404);
      if (found.status !== 'pending') return json({ error: 'Предложение уже обработано' }, 409);
      found.status = input.status;
      found.reviewedAt = new Date().toISOString();
      await write(inboxPath, { items }, current.etag);
      return json({ updated: true });
    }
    const type = clean(input.type, 30), title = clean(input.title, 200), bodyText = clean(input.body, 10000), sourceChat = clean(input.sourceChat, 500);
    if (!allowedTypes.has(type) || title.length < 5 || bodyText.length < 15 || !sourceChat) return json({ error: 'Нужны тип, заголовок, содержание и источник обсуждения' }, 400);
    const proposal = { id: randomUUID(), type, title, body: bodyText, sourceChat, targetRef: clean(input.targetRef, 150), basis: clean(input.basis, 1000), createdAt: new Date().toISOString(), status: 'pending' };
    const current = await read(inboxPath);
    const items = (current.value?.items || []).filter(item => item.status === 'pending').slice(0, 150);
    if (items.some(item => item.type === type && item.title === title && item.body === bodyText && item.sourceChat === sourceChat)) return json({ accepted: true, duplicate: true });
    if (items.length >= 150) return json({ error: 'Входящие предложения заполнены' }, 409);
    await write(inboxPath, { items: [proposal, ...items] }, current.etag);
    return json({ accepted: true, id: proposal.id }, 201);
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'Некорректный JSON' }, 400);
    return fail(error);
  }
}

export async function GET(request) { return handler(request); }
export async function POST(request) { return handler(request); }
export async function PATCH(request) { return handler(request); }
