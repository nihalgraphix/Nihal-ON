import { createSign } from 'node:crypto';

const SITE_URL = 'https://nihal-on.vercel.app/';

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

async function getAccessToken(serviceAccount: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = header + '.' + claim;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = unsigned + '.' + signer.sign(serviceAccount.private_key).toString('base64url');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Google authorization failed');
  }
  return data.access_token as string;
}

async function querySearchConsole(token: string, startDate: string, endDate: string, dimensions: string[]) {
  const response = await fetch(
    'https://searchconsole.googleapis.com/webmasters/v3/sites/' +
      encodeURIComponent(SITE_URL) + '/searchAnalytics/query',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: 10,
        type: 'web',
      }),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    const error = data?.error?.message || 'Search Console query failed';
    throw new Error(error);
  }
  return data.rows || [];
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vary', 'Authorization');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dashboardToken = process.env.SEARCH_CONSOLE_DASHBOARD_TOKEN;
  const suppliedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token;
  if (dashboardToken && suppliedToken !== dashboardToken) {
    return res.status(401).json({ error: 'Dashboard authentication required.' });
  }

  const requestedDays = Number(req.query?.days || 28);
  const days = [7, 28, 90].includes(requestedDays) ? requestedDays : 28;
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3); // Search Console data can be delayed.
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const format = (date: Date) => date.toISOString().slice(0, 10);
  const startDate = format(start);
  const endDate = format(end);

  const rawAccount = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT;
  if (!rawAccount) {
    // Return sample/demo Search Console dataset for nihal-on.vercel.app with setup notice
    const sampleDaily = [];
    const step = days / 7;
    for (let i = 0; i < 7; i++) {
      const d = new Date(end);
      d.setUTCDate(d.getUTCDate() - Math.floor((6 - i) * step));
      const dateStr = format(d);
      const baseImpressions = 120 + Math.floor(Math.sin(i) * 30) + (i * 15);
      const baseClicks = Math.floor(baseImpressions * 0.052);
      sampleDaily.push({
        date: dateStr,
        clicks: baseClicks,
        impressions: baseImpressions,
        ctr: 0.052,
        position: 6.4 - (i * 0.2),
      });
    }

    const totalImpressions = sampleDaily.reduce((a, b) => a + b.impressions, 0);
    const totalClicks = sampleDaily.reduce((a, b) => a + b.clicks, 0);

    return res.status(200).json({
      siteUrl: SITE_URL,
      startDate,
      endDate,
      days,
      isDemoMode: true,
      setupRequired: true,
      setupNotice: 'Google Search Console API service account is not yet configured in environment variables. Showing simulated performance data for https://nihal-on.vercel.app/. Follow /docs/google-search-console-setup.md to enable live Google API data.',
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: totalClicks / (totalImpressions || 1),
        position: 5.8,
      },
      daily: sampleDaily,
      topQueries: [
        { query: 'Nihal Mohammed', clicks: 84, impressions: 840, ctr: 0.10, position: 1.2 },
        { query: 'Nihal Mohammed portfolio', clicks: 62, impressions: 480, ctr: 0.129, position: 1.1 },
        { query: 'Creative Technologist portfolio', clicks: 45, impressions: 920, ctr: 0.048, position: 4.3 },
        { query: 'Cyberpunk UI designer', clicks: 38, impressions: 710, ctr: 0.053, position: 3.8 },
        { query: 'Framer Motion 3D showcase', clicks: 29, impressions: 630, ctr: 0.046, position: 5.1 },
        { query: 'Nihal graphix', clicks: 24, impressions: 210, ctr: 0.114, position: 1.4 },
        { query: 'Next.js portfolio templates 2026', clicks: 19, impressions: 540, ctr: 0.035, position: 7.2 },
      ],
      topPages: [
        { page: 'https://nihal-on.vercel.app/', clicks: 198, impressions: 2450, ctr: 0.08, position: 2.1 },
        { page: 'https://nihal-on.vercel.app/#projects', clicks: 54, impressions: 980, ctr: 0.055, position: 4.6 },
        { page: 'https://nihal-on.vercel.app/blog', clicks: 32, impressions: 620, ctr: 0.051, position: 5.3 },
        { page: 'https://nihal-on.vercel.app/#contact', clicks: 18, impressions: 310, ctr: 0.058, position: 3.9 },
      ],
    });
  }

  try {
    const serviceAccount = JSON.parse(rawAccount);
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      return res.status(500).json({ error: 'Service account JSON must contain client_email and private_key.' });
    }

    const accessToken = await getAccessToken(serviceAccount);
    const [daily, queries, pages] = await Promise.all([
      querySearchConsole(accessToken, startDate, endDate, ['date']),
      querySearchConsole(accessToken, startDate, endDate, ['query']),
      querySearchConsole(accessToken, startDate, endDate, ['page']),
    ]);

    const totals = daily.reduce((acc: { clicks: number; impressions: number; ctr: number; positionWeighted: number }, row: any) => {
      acc.clicks += row.clicks || 0;
      acc.impressions += row.impressions || 0;
      acc.ctr += (row.ctr || 0) * (row.impressions || 0);
      acc.positionWeighted += (row.position || 0) * (row.impressions || 0);
      return acc;
    }, { clicks: 0, impressions: 0, ctr: 0, positionWeighted: 0 });

    return res.status(200).json({
      siteUrl: SITE_URL,
      startDate,
      endDate,
      days,
      isDemoMode: false,
      totals: {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: totals.impressions ? totals.ctr / totals.impressions : 0,
        position: totals.impressions ? totals.positionWeighted / totals.impressions : 0,
      },
      daily: daily.map((row: any) => ({
        date: row.keys?.[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })),
      topQueries: queries.map((row: any) => ({
        query: row.keys?.[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })),
      topPages: pages.map((row: any) => ({
        page: row.keys?.[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })),
    });
  } catch (error: any) {
    console.error('Search Console API error:', error);
    return res.status(502).json({
      error: 'Could not retrieve Search Console data.',
      details: error?.message || 'Unknown Google API error',
    });
  }
}
