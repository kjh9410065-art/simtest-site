import core from './worker-core.js';
import { addImageBridge } from './image-bridge.js';
export default { async fetch(request, env, ctx) { const response = await core.fetch(request, env, ctx); const type = response.headers.get('content-type') || ''; if (!type.includes('text/html')) return response; const html = await response.text(); return new Response(addImageBridge(html), { status: response.status, statusText: response.statusText, headers: new Headers(response.headers) }); } };
