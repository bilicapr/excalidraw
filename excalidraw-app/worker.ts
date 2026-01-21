import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  EXCALIDRAW_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API Routes for Sharing
    if (url.pathname.startsWith('/api/v2/')) {
        // POST /api/v2/post/
        if (request.method === 'POST' && url.pathname === '/api/v2/post/') {
            try {
                const id = crypto.randomUUID();
                const buffer = await request.arrayBuffer();
                await env.EXCALIDRAW_KV.put(id, buffer);
                return new Response(JSON.stringify({ id, url: url.origin + '/api/v2/' + id }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Failed to save' }), { status: 500 });
            }
        }

        // GET /api/v2/:id
        // The ID comes after /api/v2/
        const id = url.pathname.replace('/api/v2/', '');
        if (request.method === 'GET' && id) {
             try {
                 const data = await env.EXCALIDRAW_KV.get(id, { type: 'arrayBuffer' });
                 if (!data) {
                     return new Response('Not Found', { status: 404 });
                 }
                 return new Response(data, {
                     headers: { 'Content-Type': 'application/octet-stream' }
                 });
             } catch (e) {
                 return new Response('Error', { status: 500 });
             }
        }
    }


    // Redirects
    if (url.pathname.startsWith('/webex/')) {
      return Response.redirect('https://for-webex.excalidraw.com' + url.pathname.replace('/webex', ''), 301);
    }
    
    const host = request.headers.get('Host');
    if (host === 'vscode.excalidraw.com') {
      return Response.redirect('https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor', 301);
    }

    // Serve assets
    let response = await env.ASSETS.fetch(request);

    // SPA fallback
    if (response.status === 404 && !url.pathname.startsWith('/assets/') && !url.pathname.startsWith('/api/')) {
       const indexRequest = new Request(new URL('/', request.url), request);
       response = await env.ASSETS.fetch(indexRequest);
    }

    // Add headers
    const newHeaders = new Headers(response.headers);
    
    // Default headers for all responses
    if (!newHeaders.has('Access-Control-Allow-Origin')) {
        newHeaders.set('Access-Control-Allow-Origin', '*');
    }
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'no-referrer-when-downgrade');

    // Font caching and specific CORS
    if (url.pathname.endsWith('.woff2')) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000');
        
        if (url.pathname.match(/(Virgil|Cascadia|Assistant-Regular).woff2/)) {
            newHeaders.set('Access-Control-Allow-Origin', '*');
        } else {
             newHeaders.set('Access-Control-Allow-Origin', '*');
        }
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
  },
};
