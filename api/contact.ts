const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxNW40z9ak0LQvvT5dMqa4UTGWNASouVnUHmcFu5G9A2CQsLTxOSfd_r56gX-GUrGHJ/exec";

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, country, message, webhookUrl } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });
    const targetEmail = "nihal.graphix@gmail.com";
    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Portfolio Visitor";

    // 1. Dispatch to FormSubmit
    try {
      await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `Portfolio Contact Inquiry from ${fullName}`,
          _replyto: email,
          "Sender Name": fullName,
          "Sender Email": email,
          "Phone Number": phone || "N/A",
          "Country & Place": country || "N/A",
          "Message": message
        })
      });
    } catch (fErr) {
      console.warn("Vercel FormSubmit error:", fErr);
    }

    // 2. Dispatch to Google Apps Script Webhook
    const targetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || webhookUrl || DEFAULT_WEBHOOK_URL;
    if (targetWebhook) {
      try {
        const fullPayload = {
          timestamp,
          Timestamp: timestamp,
          date: timestamp,
          Date: timestamp,
          firstName: firstName || "",
          "First Name": firstName || "",
          Firstname: firstName || "",
          first_name: firstName || "",
          lastName: lastName || "",
          "Last Name": lastName || "",
          Lastname: lastName || "",
          last_name: lastName || "",
          name: fullName,
          Name: fullName,
          fullName: fullName,
          "Full Name": fullName,
          email: email || "",
          Email: email || "",
          phone: phone || "",
          Phone: phone || "",
          phone_number: phone || "",
          "Phone Number": phone || "",
          country: country || "",
          Country: country || "",
          "Country / Place": country || "",
          message: message || "",
          Message: message || "",
          comments: message || "",
          Comments: message || ""
        };

        const formParams = new URLSearchParams();
        for (const [k, v] of Object.entries(fullPayload)) {
          formParams.append(k, String(v));
        }

        const urlWithQuery = targetWebhook + (targetWebhook.includes("?") ? "&" : "?") + formParams.toString();

        await fetch(urlWithQuery, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(fullPayload),
          redirect: "follow"
        });
      } catch (wErr) {
        console.error("Vercel Google Sheets Webhook error:", wErr);
      }
    }

    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err: any) {
    console.error("Vercel handler error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
