import { kv } from '@vercel/kv';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing test ID' });

  try {
    const key = `test:${id}`;
    const test = await kv.get(key);

    if (!test) return res.status(404).json({ error: 'Test not found' });

    const now = Date.now();
    if (now - test.createdAt > THREE_DAYS_MS) {
      await kv.del(key);
      return res.status(410).json({ error: 'Test expired (3-day limit)' });
    }

    return res.status(200).json(test);
  } catch (err) {
    console.error('Config error:', err);
    return res.status(500).json({ error: err.message });
  }
}