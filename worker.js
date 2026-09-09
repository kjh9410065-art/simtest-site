import core from './worker-core.js';
import { addImageBridge } from './image-bridge.js';

// 기존 Worker 기능을 유지하면서 HTML에 생성된 사이트 이미지를 연결합니다.
export default {
  async fetch(request, env, ctx) {
    const response = await core.fetch(request, env, ctx);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    const html = await response.text();
    const updated = addImageBridge(html);
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });
  }
};
