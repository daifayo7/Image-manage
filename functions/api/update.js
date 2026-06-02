export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    try {
        let key, updates;

        if (request.method === 'POST') {
            const body = await request.json();
            key = body.key;
            updates = body;
            delete updates.key;
        } else {
            key = url.searchParams.get('key');
            updates = {};
            for (const [k, v] of url.searchParams) {
                if (k !== 'key') updates[k] = v;
            }
        }

        if (!key) {
            return new Response(JSON.stringify({ error: 'Missing key parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const value = await env.img_url.getWithMetadata(key);
        if (!value || !value.metadata) {
            return new Response(JSON.stringify({ error: 'Record not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const metadata = { ...value.metadata };
        for (const [k, v] of Object.entries(updates)) {
            if (k === 'liked') {
                metadata[k] = v === true || v === 'true';
            } else if (k === 'TimeStamp' || k === 'fileSize') {
                metadata[k] = Number(v);
            } else {
                metadata[k] = String(v);
            }
        }

        await env.img_url.put(key, "", { metadata });

        return new Response(JSON.stringify({ success: true, metadata }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Update error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
