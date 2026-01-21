import { ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

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
    if (response.status === 404 && !url.pathname.startsWith('/assets/')) {
       const indexRequest = new Request(new URL('/', request.url), request);
       response = await env.ASSETS.fetch(indexRequest);
    }

    // Add headers
    const newHeaders = new Headers(response.headers);
    
    // Default headers for all responses
    if (!newHeaders.has('Access-Control-Allow-Origin')) {
        newHeaders.set('Access-Control-Allow-Origin', 'https://excalidraw.com');
    }
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'origin');

    // Font caching and specific CORS
    if (url.pathname.endsWith('.woff2')) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000');
        
        if (url.pathname.match(/(Virgil|Cascadia|Assistant-Regular).woff2/)) {
            newHeaders.set('Access-Control-Allow-Origin', '*');
        } else {
             newHeaders.set('Access-Control-Allow-Origin', 'https://excalidraw.com');
        }
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
  },
};
