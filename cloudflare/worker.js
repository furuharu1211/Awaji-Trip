// Cloudflare Worker: R2 binding `PHOTOS` -> `awaji-trip-photos`
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/') {
        return jsonResponse({ message: 'Awaji Photo API is running' }, 200);
      }

      if (request.method === 'GET' && url.pathname === '/photos') {
        const objects = [];
        let cursor;
        do {
          const result = await env.PHOTOS.list({ prefix: 'gallery/', cursor });
          objects.push(...result.objects);
          cursor = result.truncated ? result.cursor : undefined;
        } while (cursor);

        const photos = objects
          .filter(object => object.key !== 'gallery/')
          .map(object => ({
            key: object.key,
            name: object.key.slice('gallery/'.length),
            size: object.size,
            uploaded: object.uploaded,
            url: `${url.origin}/photo/${encodeURIComponent(object.key)}`,
          }))
          .sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());

        return jsonResponse({ photos }, 200, { 'Cache-Control': 'no-store' });
      }

      if (url.pathname.startsWith('/photo/')) {
        let key;
        try {
          key = decodeURIComponent(url.pathname.slice('/photo/'.length));
        } catch {
          return jsonResponse({ error: 'Invalid photo key' }, 400);
        }
        if (!key.startsWith('gallery/') || key === 'gallery/') {
          return jsonResponse({ error: 'Invalid photo key' }, 400);
        }

        if (request.method === 'GET') {
          const object = await env.PHOTOS.get(key);
          if (!object) return jsonResponse({ error: 'Photo not found' }, 404);
          const headers = new Headers(CORS_HEADERS);
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          headers.set('Cache-Control', 'public, max-age=3600');
          return new Response(object.body, { status: 200, headers });
        }

        if (request.method === 'DELETE') {
          const object = await env.PHOTOS.head(key);
          if (!object) return jsonResponse({ error: 'Photo not found' }, 404);
          await env.PHOTOS.delete(key);
          return jsonResponse({ success: true, key }, 200);
        }
      }

      if (request.method === 'POST' && url.pathname === '/upload') {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || typeof file === 'string') {
          return jsonResponse({ error: '画像ファイルがありません' }, 400);
        }
        if (!file.type.startsWith('image/')) {
          return jsonResponse({ error: '画像ファイルのみアップロードできます' }, 400);
        }
        if (file.size > MAX_FILE_SIZE) {
          return jsonResponse({ error: '画像は20MB以下にしてください' }, 400);
        }

        const safeName = file.name.replace(/[^\w.\-ぁ-んァ-ヶ一-龠]/g, '_');
        const key = `gallery/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        await env.PHOTOS.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });
        return jsonResponse({
          success: true,
          key,
          url: `${url.origin}/photo/${encodeURIComponent(key)}`,
        }, 201);
      }

      return jsonResponse({ error: 'Not Found' }, 404);
    } catch (error) {
      console.error(error);
      return jsonResponse({ error: 'Server error' }, 500);
    }
  },
};

function jsonResponse(data, status, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      ...extraHeaders,
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
}
