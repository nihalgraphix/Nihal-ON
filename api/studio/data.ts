import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const publishedPath = path.join(process.cwd(), 'data', 'studio_published.json');
    if (fs.existsSync(publishedPath)) {
      const fileData = fs.readFileSync(publishedPath, 'utf-8');
      return res.status(200).send(fileData);
    }
  } catch (e) {
    console.error('Vercel studio data handler error:', e);
  }

  return res.status(200).json({ success: true, data: null });
}
