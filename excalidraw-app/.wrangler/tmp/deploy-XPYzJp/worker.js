// worker.ts
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/webex/")) {
      return Response.redirect("https://for-webex.excalidraw.com" + url.pathname.replace("/webex", ""), 301);
    }
    const host = request.headers.get("Host");
    if (host === "vscode.excalidraw.com") {
      return Response.redirect("https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor", 301);
    }
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && !url.pathname.startsWith("/assets/")) {
      const indexRequest = new Request(new URL("/", request.url), request);
      response = await env.ASSETS.fetch(indexRequest);
    }
    const newHeaders = new Headers(response.headers);
    if (!newHeaders.has("Access-Control-Allow-Origin")) {
      newHeaders.set("Access-Control-Allow-Origin", "https://excalidraw.com");
    }
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("Referrer-Policy", "origin");
    if (url.pathname.endsWith(".woff2")) {
      newHeaders.set("Cache-Control", "public, max-age=31536000");
      if (url.pathname.match(/(Virgil|Cascadia|Assistant-Regular).woff2/)) {
        newHeaders.set("Access-Control-Allow-Origin", "*");
      } else {
        newHeaders.set("Access-Control-Allow-Origin", "https://excalidraw.com");
      }
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
