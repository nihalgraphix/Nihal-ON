export interface ContactMessageData {
  id?: string;
  timestamp?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

const SHEET_ID_KEY = 'nihal_contact_spreadsheet_id';
const WEBHOOK_URL_KEY = 'nihal_contact_sheet_webhook_url';

export const getStoredSpreadsheetId = (): string | null => {
  return localStorage.getItem(SHEET_ID_KEY);
};

export const setStoredSpreadsheetId = (id: string) => {
  localStorage.setItem(SHEET_ID_KEY, id);
};

export const getStoredWebhookUrl = (): string | null => {
  return localStorage.getItem(WEBHOOK_URL_KEY);
};

export const setStoredWebhookUrl = (url: string) => {
  localStorage.setItem(WEBHOOK_URL_KEY, url);
};

export const extractSpreadsheetId = (input: string): string => {
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return input.trim();
};

export const createContactSpreadsheet = async (accessToken: string, forceNew = false): Promise<string> => {
  const existingId = getStoredSpreadsheetId();
  if (existingId && !forceNew) {
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (checkRes.ok) {
        return existingId;
      }
    } catch (e) {
      console.warn('Existing spreadsheet check failed, creating new one', e);
    }
  }

  // Create new spreadsheet
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: 'Nihal . ON Portfolio - Contact Submissions (nihal.graphix@gmail.com)'
      },
      sheets: [
        {
          properties: {
            title: 'Contact Submissions',
            gridProperties: {
              frozenRowCount: 1
            }
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'First Name' } },
                    { userEnteredValue: { stringValue: 'Last Name' } },
                    { userEnteredValue: { stringValue: 'Email' } },
                    { userEnteredValue: { stringValue: 'Phone' } },
                    { userEnteredValue: { stringValue: 'Country / Place' } },
                    { userEnteredValue: { stringValue: 'Message' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to create Google Sheet. Please check Google permissions.');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  setStoredSpreadsheetId(spreadsheetId);
  return spreadsheetId;
};

export const appendContactToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  data: ContactMessageData
): Promise<boolean> => {
  const timestamp = data.timestamp || new Date().toLocaleString('en-US', { timeZoneName: 'short' });
  const rowValues = [
    timestamp,
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.phone || '',
    data.country || '',
    data.message || ''
  ];

  const range = 'Contact Submissions!A:G';
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!response.ok) {
    const fallbackResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:G:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      }
    );
    return fallbackResponse.ok;
  }

  return true;
};

export const postToWebhook = async (webhookUrl: string, data: ContactMessageData): Promise<boolean> => {
  try {
    const timestamp = data.timestamp || new Date().toLocaleString('en-US', { timeZoneName: 'short' });
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script Webhooks require no-cors or redirect handling
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country || '',
        message: data.message || ''
      })
    });
    return true;
  } catch (e) {
    console.error('Webhook append error:', e);
    return false;
  }
};
