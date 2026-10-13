import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const boundaryMatch = contentType.match(/boundary=(.+)/);
    const boundary = boundaryMatch ? boundaryMatch[1].replace(/["']/g, '').split(';')[0].trim() : '';
    if (!boundary) return res.status(400).json({ error: 'Missing boundary' });

    const parts = parseMultipart(buffer, boundary);
    const filePart = parts.find(p => p.name === 'file' && p.filename);
    if (!filePart) return res.status(400).json({ error: 'No file uploaded' });

    const filename = `tat-${Date.now()}-${filePart.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blob = await put(filename, filePart.data, { access: 'public', addRandomSuffix: true });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function parseMultipart(buffer, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = 0;

  while (true) {
    const delimiterIndex = buffer.indexOf(delimiter, start);
    if (delimiterIndex === -1) break;
    if (delimiterIndex > start) {
      const partData = buffer.slice(start, delimiterIndex);
      const parsed = parsePart(partData);
      if (parsed) parts.push(parsed);
    }
    start = delimiterIndex + delimiter.length;
    if (buffer.slice(start, start + 2).equals(Buffer.from('--'))) break;
    if (buffer[start] === 0x0d || buffer[start] === 0x0a) start++;
    if (buffer[start] === 0x0a) start++;
  }
  return parts;
}

function parsePart(data) {
  const headerEnd = data.indexOf(Buffer.from('\r\n\r\n'));
  if (headerEnd === -1) return null;
  const headers = data.slice(0, headerEnd).toString();
  const content = data.slice(headerEnd + 4);
  if (content.length >= 2 && content[content.length - 2] === 0x0d && content[content.length - 1] === 0x0a) {
    return { ...parseHeaders(headers), data: content.slice(0, -2) };
  }
  return { ...parseHeaders(headers), data: content };
}

function parseHeaders(headerStr) {
  const result = { name: '', filename: '', contentType: '' };
  for (const line of headerStr.split('\r\n')) {
    if (line.toLowerCase().startsWith('content-disposition:')) {
      const match = line.match(/name="([^"]+)"/);
      if (match) result.name = match[1];
      const fileMatch = line.match(/filename="([^"]+)"/);
      if (fileMatch) result.filename = fileMatch[1];
    } else if (line.toLowerCase().startsWith('content-type:')) {
      result.contentType = line.split(':')[1].trim();
    }
  }
  return result;
}
