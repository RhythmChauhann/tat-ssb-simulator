import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const keys = await kv.keys('test:*');
    let deleted = 0;
    let errors = 0;

    for (const key of keys) {
      try {
        const test = await kv.get(key);
        if (!test) continue;

        const now = Date.now();
        if (now - test.createdAt > THREE_DAYS_MS) {
          await kv.del(key);
          if (test.pdfUrl) {
            try {
              const pathname = new URL(test.pdfUrl).pathname.split('/').pop();
              if (pathname) await del(pathname);
            } catch (e) { console.warn('Blob delete failed:', e.message); }
          }
          deleted++;
        }
      } catch (e) {
        errors++;
        console.error(`Cleanup error for ${key}:`, e);
      }
    }

    return res.status(200).json({ scanned: keys.length, deleted, errors });
  } catch (err) {
    console.error('Cleanup error:', err);
    return res.status(500).json({ error: err.message });
  }
}