import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdfUrl, ranges, title } = req.body;
    if (!pdfUrl || !Array.isArray(ranges) || ranges.length !== 11) {
      return res.status(400).json({ error: 'Invalid payload: need pdfUrl and 11 ranges' });
    }

    const id = nanoid(10);
    const createdAt = Date.now();
    const key = `test:${id}`;

    await kv.set(key, { pdfUrl, ranges, title: title || 'Untitled Test', createdAt });

    return res.status(200).json({ id });
  } catch (err) {
    console.error('Create error:', err);
    return res.status(500).json({ error: err.message });
  }
}