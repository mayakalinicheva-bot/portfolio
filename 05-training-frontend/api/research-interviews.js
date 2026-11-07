import { authorized, unavailable, json, read, write, fail } from '../lib/cloud.js';

const path = 'discovery/research-interviews-v1.json';
const respondentPattern = /^R\d{2}$/;
const questionPattern = /^Q\d{3}$/;
const blockPattern = /^B\d{2}$/;
const directIdentifierPatterns = [
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
  /(?<!\d)(?:\+7|8)[\s()\-]*\d{3}[\s()\-]*\d{3}[\s\-]*\d{2}[\s\-]*\d{2}(?!\d)/,
  /(?<!\w)@[A-Za-z0-9_]{3,}\b/,
  /https?:\/\/\S+/i,
  /\b(?:меня\s+зовут|м[оё]е?\s+имя|фамилия)\b/i,
];

function validString(value, max = 20000) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function validate(data) {
  if (!data || data.schemaVersion !== 1 || !data.source || !data.guide || !Array.isArray(data.interviews)) return false;
  if (!validString(data.source.documentId, 200) || !validString(data.source.revisionId, 1000) || !validString(data.source.title, 500)) return false;
  const { blocks, questions } = data.guide;
  if (!Array.isArray(blocks) || blocks.length !== 12 || !Array.isArray(questions) || questions.length !== 120) return false;
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index], number = index + 1, expectedIds = Array.from({ length: 10 }, (_, offset) => `Q${String(index * 10 + offset + 1).padStart(3, '0')}`);
    if (!block || block.id !== `B${String(number).padStart(2, '0')}` || block.number !== number || !blockPattern.test(block.id) || !validString(block.title, 300)) return false;
    if (!Array.isArray(block.questionIds) || JSON.stringify(block.questionIds) !== JSON.stringify(expectedIds)) return false;
  }
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index], number = index + 1, expectedBlock = `B${String(Math.floor(index / 10) + 1).padStart(2, '0')}`;
    if (!question || question.id !== `Q${String(number).padStart(3, '0')}` || question.number !== number || question.blockId !== expectedBlock || !questionPattern.test(question.id) || !validString(question.text)) return false;
  }
  const respondents = new Set();
  if (data.interviews.length < 1 || data.interviews.length > 100) return false;
  for (const interview of data.interviews) {
    if (!interview || !respondentPattern.test(interview.respondentId) || respondents.has(interview.respondentId) || !Array.isArray(interview.answers) || interview.answers.length !== 120) return false;
    respondents.add(interview.respondentId);
    const numbers = new Set();
    for (const answer of interview.answers) {
      if (!answer || !Number.isInteger(answer.questionNumber) || answer.questionNumber < 1 || answer.questionNumber > 120 || numbers.has(answer.questionNumber)) return false;
      numbers.add(answer.questionNumber);
      const questionId = `Q${String(answer.questionNumber).padStart(3, '0')}`;
      if (answer.questionId !== questionId || answer.id !== `${interview.respondentId}-${questionId}` || !validString(answer.answer)) return false;
    }
  }
  const serialized = JSON.stringify(data);
  return !directIdentifierPatterns.some(pattern => pattern.test(serialized));
}

function summary(value) {
  const data = value?.data;
  if (!data) return { revision: 0, savedAt: null, sourceRevisionId: null, interviewCount: 0, blockCount: 0, questionCount: 0, answerCount: 0, respondents: [] };
  return {
    revision: value.revision,
    savedAt: value.savedAt,
    sourceRevisionId: data.source.revisionId,
    interviewCount: data.interviews.length,
    blockCount: data.guide.blocks.length,
    questionCount: data.guide.questions.length,
    answerCount: data.interviews.reduce((total, interview) => total + interview.answers.length, 0),
    respondents: data.interviews.map(interview => ({ respondentId: interview.respondentId, answerCount: interview.answers.length })),
  };
}

async function handler(request) {
  if (!authorized(request)) return json({ error: 'Неверный ключ синхронизации' }, 401);
  if (unavailable()) return json({ error: 'Облачная синхронизация ещё не настроена' }, 503);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Метод не поддерживается' }, 405);
  try {
    const current = await read(path);
    if (request.method === 'GET') {
      if (new URL(request.url).searchParams.get('summary') === '1') return json(summary(current.value));
      return json(current.value || { revision: 0, savedAt: null, data: null });
    }
    const body = await request.text();
    if (body.length > 4_000_000) return json({ error: 'Набор интервью слишком велик' }, 413);
    const incoming = JSON.parse(body);
    if (!Number.isInteger(incoming.revision) || incoming.revision < 0 || !validate(incoming.data)) return json({ error: 'Некорректный набор интервью' }, 400);
    if (current.value?.data && JSON.stringify(current.value.data) === JSON.stringify(incoming.data)) return json({ ...summary(current.value), unchanged: true });
    const revision = current.value?.revision || 0;
    if (incoming.revision !== revision) return json({ error: 'Интервью изменились в другом клиенте. Перечитай текущую ревизию перед импортом.', revision }, 409);
    const savedAt = new Date().toISOString();
    const value = { revision: revision + 1, savedAt, data: incoming.data };
    await write(path, value, current.etag);
    return json(summary(value));
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: 'Некорректный JSON' }, 400);
    return fail(error);
  }
}

export async function GET(request) { return handler(request); }
export async function POST(request) { return handler(request); }
