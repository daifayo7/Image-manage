export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1000);
  const cursor = url.searchParams.get('cursor') || undefined;

  try {
    const listResult = await env.img_url.list({ limit, cursor });
    const records = [];

    for (const key of listResult.keys) {
      const value = await env.img_url.getWithMetadata(key.name);
      if (value && value.metadata) {
        records.push({
          key: key.name,
          url: `/file/${key.name}`,
          name: value.metadata.fileName || key.name,
          time: value.metadata.TimeStamp || 0,
          fileSize: value.metadata.fileSize || 0,
          liked: value.metadata.liked || false,
          label: value.metadata.Label || 'None',
          listType: value.metadata.ListType || 'None',
        });
      }
    }

    records.sort((a, b) => b.time - a.time);

    const filtered = q
      ? records.filter(r =>
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.key.toLowerCase().includes(q.toLowerCase())
        )
      : records;

    return new Response(JSON.stringify({
      records: filtered.slice(0, 100),
      total: filtered.length,
      cursor: listResult.list_complete ? null : listResult.cursor,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
