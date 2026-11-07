import { ORIGIN, access, challenge, oauthJson } from '../lib/oauth.js';

const tools = [
  {
    name: 'get_discovery_context',
    title: 'Read Portfolio Discovery',
    description: 'Use this at the start of a Portfolio Discovery discussion to read the current Project Scope, hypotheses, entities, requirements, decisions and pending proposals.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['discovery:read'] }] },
  },
  {
    name: 'submit_discovery_proposal',
    title: 'Propose a Discovery update',
    description: 'Use this only for a new, meaningful insight from a Portfolio project discussion. Add one structured proposal to the review inbox; never write a raw transcript or silently change accepted records.',
    inputSchema: {
      type: 'object',
      required: ['type', 'title', 'body', 'sourceChat'],
      properties: {
        type: { type: 'string', enum: ['document', 'hypothesis', 'research', 'decision', 'entity', 'requirement', 'task'] },
        title: { type: 'string', minLength: 5, maxLength: 200 },
        body: { type: 'string', minLength: 15, maxLength: 10000 },
        sourceChat: { type: 'string', description: 'Title of the project conversation, without private transcript text.' },
        targetRef: { type: 'string', description: 'Optional reference to an existing Discovery record.' },
        basis: { type: 'string', description: 'Evidence or explicit user decision supporting the proposal.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['discovery:write'] }] },
  },
  {
    name: 'get_research_interviews',
    title: 'List depth interviews',
    description: 'Read the anonymized depth-interview inventory and integrity counts. This is raw research evidence, separate from Discovery proposals.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['discovery:read'] }] },
  },
  {
    name: 'get_research_interview',
    title: 'Read one depth interview',
    description: 'Read one anonymized respondent interview with its canonical questions and structured answers.',
    inputSchema: {
      type: 'object',
      required: ['respondentId'],
      properties: { respondentId: { type: 'string', pattern: '^R\\d{2}$', description: 'Anonymized respondent ID, for example R01.' } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['discovery:read'] }] },
  },
  {
    name: 'import_research_interviews',
    title: 'Import structured depth interviews',
    description: 'Atomically import a validated anonymized question guide and respondent answers into the dedicated research-evidence store. Never use this for interpreted findings or proposals.',
    inputSchema: {
      type: 'object',
      required: ['revision', 'data'],
      properties: {
        revision: { type: 'integer', minimum: 0, description: 'Current research-interview revision. Use get_research_interviews first.' },
        data: {
          type: 'object',
          required: ['schemaVersion', 'source', 'guide', 'interviews'],
          properties: {
            schemaVersion: { type: 'integer', const: 1 },
            source: { type: 'object' },
            guide: { type: 'object' },
            interviews: { type: 'array', minItems: 1, maxItems: 100, items: { type: 'object' } },
          },
        },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['discovery:write'] }] },
  },
];

const rpc = (id, result) => oauthJson({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => oauthJson({ jsonrpc: '2.0', id, error: { code, message } });
const toolResult = (id, value, isError = false) => rpc(id, { content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value, ...(isError ? { isError: true } : {}) });

function authResult(id, scope) {
  return rpc(id, {
    content: [{ type: 'text', text: 'Connect Portfolio Discovery to use this tool.' }],
    _meta: { 'mcp/www_authenticate': [challenge(scope)] },
    isError: true,
  });
}

async function internal(method, body) {
  return fetch(`${ORIGIN}/api/gpt`, {
    method,
    headers: { authorization: `Bearer ${process.env.DISCOVERY_SYNC_KEY || ''}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function researchInternal(method, body, query = '') {
  return fetch(`${ORIGIN}/api/research-interviews${query}`, {
    method,
    headers: { authorization: `Bearer ${process.env.DISCOVERY_SYNC_KEY || ''}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export async function POST(request) {
  try {
    const raw = await request.text();
    if (raw.length > 4_000_000) return rpcError(null, -32600, 'Request too large');
    const input = JSON.parse(raw);
    if (!input || input.jsonrpc !== '2.0' || typeof input.method !== 'string') return rpcError(input?.id ?? null, -32600, 'Invalid request');
    const { id, method, params = {} } = input;
    if (method === 'notifications/initialized' || method === 'notifications/cancelled') return new Response(null, { status: 202 });
    if (id === undefined || id === null) return rpcError(null, -32600, 'Missing request ID');
    if (method === 'initialize') return rpc(id, { protocolVersion: ['2025-03-26', '2025-06-18', '2025-11-25'].includes(params.protocolVersion) ? params.protocolVersion : '2025-11-25', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'portfolio-discovery', version: '0.3.0' } });
    if (method === 'ping') return rpc(id, {});
    if (method === 'tools/list') return rpc(id, { tools });
    if (method !== 'tools/call') return rpcError(id, -32601, 'Method not found');
    if (params.name === 'get_discovery_context') {
      if (!access(request, 'discovery:read')) return authResult(id, 'discovery:read');
      const result = await internal('GET');
      return toolResult(id, await result.json(), !result.ok);
    }
    if (params.name === 'submit_discovery_proposal') {
      if (!access(request, 'discovery:write')) return authResult(id, 'discovery:write');
      const result = await internal('POST', params.arguments || {});
      return toolResult(id, await result.json(), !result.ok);
    }
    if (params.name === 'get_research_interviews') {
      if (!access(request, 'discovery:read')) return authResult(id, 'discovery:read');
      const result = await researchInternal('GET', null, '?summary=1');
      return toolResult(id, await result.json(), !result.ok);
    }
    if (params.name === 'get_research_interview') {
      if (!access(request, 'discovery:read')) return authResult(id, 'discovery:read');
      const respondentId = params.arguments?.respondentId;
      if (typeof respondentId !== 'string' || !/^R\d{2}$/.test(respondentId)) return toolResult(id, { error: 'Некорректный ID респондента' }, true);
      const result = await researchInternal('GET');
      const payload = await result.json();
      if (!result.ok) return toolResult(id, payload, true);
      const interview = payload.data?.interviews?.find(item => item.respondentId === respondentId);
      if (!interview) return toolResult(id, { error: 'Интервью не найдено' }, true);
      return toolResult(id, { revision: payload.revision, savedAt: payload.savedAt, source: payload.data.source, guide: payload.data.guide, interview });
    }
    if (params.name === 'import_research_interviews') {
      if (!access(request, 'discovery:write')) return authResult(id, 'discovery:write');
      const result = await researchInternal('POST', params.arguments || {});
      return toolResult(id, await result.json(), !result.ok);
    }
    return rpcError(id, -32602, 'Unknown tool');
  } catch (error) {
    if (error instanceof SyntaxError) return rpcError(null, -32700, 'Parse error');
    console.error('Discovery MCP error:', error);
    return rpcError(null, -32603, 'Internal error');
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
