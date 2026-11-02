import { ORIGIN, RESOURCE, SCOPES, oauthJson } from '../../lib/oauth.js';

export function GET() {
  return oauthJson({ resource: RESOURCE, authorization_servers: [ORIGIN], scopes_supported: SCOPES, bearer_methods_supported: ['header'] });
}
