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
  const suppliedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!dashboardToken || !suppliedToken || suppliedToken !== dashboardToken) {
    return res.status(401).json({ error: 'Dashboard authentication required.' });
  }

  const rawAccount = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT;
  if (!rawAccount) {
    return res.status(503).json({
      error: 'Google Search Console is not configured yet.',
      setup: 'Add GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT and SEARCH_CONSOLE_DASHBOARD_TOKEN in Vercel environment variables.',
    });
  }

  try {
    const serviceAccount = JSON.parse(rawAccount);
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      return res.status(500).json({ error: 'Service account JSON must contain client_email and private_key.' });
    }

    const requestedDays = Number(req.query.days || 28);
    const days = [7, 28, 90].includes(requestedDays) ? requestedDays : 28;
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 3); // Search Console data can be delayed.
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const format = (date: Date) => date.toISOString().slice(0, 10);
    const startDate = format(start);
    const endDate = format(end);

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
