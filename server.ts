import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure data directory exists for persistent storage
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const WEBHOOK_FILE = path.join(DATA_DIR, "webhook.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Direct file upload endpoint
  app.post("/api/studio/upload", (req, res) => {
    try {
      const { fileDataUrl, filename } = req.body;
      if (!fileDataUrl) {
        return res.status(400).json({ error: "fileDataUrl is required" });
      }

      // Parse base64
      const matches = fileDataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let ext = "jpg";
      let buffer: Buffer;

      if (matches && matches.length === 3) {
        const mime = matches[1];
        ext = mime.split("/")[1] || "jpg";
        if (ext === "jpeg") ext = "jpg";
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(fileDataUrl, "base64");
      }

      const cleanName = (filename || "photo").replace(/[^a-zA-Z0-9._-]/g, "_").split('.')[0];
      const uniqueFilename = `${Date.now()}_${cleanName}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueFilename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFilename}`;
      return res.json({ success: true, url: publicUrl, filename: uniqueFilename });
    } catch (err: any) {
      console.error("Upload handler error:", err);
      return res.status(500).json({ error: err.message || "Failed to save upload" });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Persistent messages storage
  let messagesStore: Array<{
    id: string;
    timestamp: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    message: string;
  }> = [];

  if (fs.existsSync(MESSAGES_FILE)) {
    try {
      messagesStore = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    } catch (e) {
      console.error("Error loading persisted messages:", e);
    }
  }

  // Persistent webhook URL
  const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxNW40z9ak0LQvvT5dMqa4UTGWNASouVnUHmcFu5G9A2CQsLTxOSfd_r56gX-GUrGHJ/exec";
  let serverWebhookUrl: string | null = DEFAULT_WEBHOOK_URL;
  try {
    fs.writeFileSync(WEBHOOK_FILE, JSON.stringify({ webhookUrl: serverWebhookUrl }, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving updated webhook URL:", e);
  }

  const saveMessages = () => {
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messagesStore, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving messages file:", e);
    }
  };

  const saveWebhook = (url: string | null) => {
    try {
      fs.writeFileSync(WEBHOOK_FILE, JSON.stringify({ webhookUrl: url }, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving webhook file:", e);
    }
  };

  // Endpoint to retrieve stored messages
  app.get("/api/messages", (_req, res) => {
    res.json({
      success: true,
      count: messagesStore.length,
      messages: messagesStore,
      webhookConfigured: !!serverWebhookUrl,
      webhookUrl: serverWebhookUrl
    });
  });

  // Endpoint to download messages as CSV
  app.get("/api/messages/csv", (_req, res) => {
    const headers = ["Timestamp", "First Name", "Last Name", "Email", "Phone", "Country / Place", "Message"];
    const csvRows = [headers.join(",")];

    for (const msg of messagesStore) {
      const escape = (val: string) => `"${(val || "").replace(/"/g, '""')}"`;
      csvRows.push([
        escape(msg.timestamp),
        escape(msg.firstName),
        escape(msg.lastName),
        escape(msg.email),
        escape(msg.phone),
        escape(msg.country),
        escape(msg.message)
      ].join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="nihal_portfolio_messages.csv"');
    res.status(200).send(csvRows.join("\n"));
  });

  // Message read/unread status update
  app.patch("/api/messages/:id/read", (req, res) => {
    const { id } = req.params;
    const msg = messagesStore.find(m => m.id === id);
    if (msg) {
      (msg as any).read = !(msg as any).read;
      saveMessages();
      return res.json({ success: true, message: msg });
    }
    res.status(404).json({ error: "Message not found" });
  });

  // Message delete
  app.delete("/api/messages/:id", (req, res) => {
    const { id } = req.params;
    const index = messagesStore.findIndex(m => m.id === id);
    if (index !== -1) {
      messagesStore.splice(index, 1);
      saveMessages();
      return res.json({ success: true });
    }
    res.status(404).json({ error: "Message not found" });
  });

  // --- STUDIO DATA STORAGE & PERSISTENCE ---
  const STUDIO_PUBLISHED_FILE = path.join(DATA_DIR, "studio_published.json");
  const STUDIO_DRAFT_FILE = path.join(DATA_DIR, "studio_draft.json");
  const STUDIO_REVISIONS_FILE = path.join(DATA_DIR, "studio_revisions.json");
  const STUDIO_MEDIA_FILE = path.join(DATA_DIR, "studio_media.json");
  const STUDIO_ANALYTICS_FILE = path.join(DATA_DIR, "studio_analytics.json");

  const readJsonFile = (filePath: string, fallback: any = null) => {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
    return fallback;
  };

  const writeJsonFile = (filePath: string, data: any) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.error(`Error writing ${filePath}:`, e);
      return false;
    }
  };

  // Get Published Studio Data
  app.get("/api/studio/data", (_req, res) => {
    const data = readJsonFile(STUDIO_PUBLISHED_FILE, null);
    res.json({ success: true, data });
  });

  // Get Working Draft
  app.get("/api/studio/draft", (_req, res) => {
    let draft = readJsonFile(STUDIO_DRAFT_FILE, null);
    if (!draft) {
      draft = readJsonFile(STUDIO_PUBLISHED_FILE, null);
    }
    res.json({ success: true, draft });
  });

  // Save Working Draft
  app.post("/api/studio/draft", (req, res) => {
    const { draft } = req.body;
    if (!draft) return res.status(400).json({ error: "Draft data is required" });
    const saved = writeJsonFile(STUDIO_DRAFT_FILE, draft);
    res.json({ success: saved, timestamp: new Date().toISOString() });
  });

  // Publish Changes
  app.post("/api/studio/publish", (req, res) => {
    const { data, note } = req.body;
    if (!data) return res.status(400).json({ error: "Data is required to publish" });

    // 1. Save published data
    writeJsonFile(STUDIO_PUBLISHED_FILE, data);
    writeJsonFile(STUDIO_DRAFT_FILE, data);

    // 2. Append revision history
    const revisions = readJsonFile(STUDIO_REVISIONS_FILE, []);
    const revision = {
      id: `rev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      note: note || "Published from Portfolio Admin Studio",
      publishedBy: "nihal.graphix@gmail.com",
      dataSnapshot: data
    };
    revisions.unshift(revision);
    // keep latest 30 revisions
    if (revisions.length > 30) revisions.pop();
    writeJsonFile(STUDIO_REVISIONS_FILE, revisions);

    res.json({ success: true, revisionId: revision.id, timestamp: revision.timestamp });
  });

  // Revisions List
  app.get("/api/studio/revisions", (_req, res) => {
    const revisions = readJsonFile(STUDIO_REVISIONS_FILE, []);
    const summaries = revisions.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      note: r.note,
      publishedBy: r.publishedBy
    }));
    res.json({ success: true, revisions: summaries });
  });

  // Restore Revision
  app.post("/api/studio/restore/:id", (req, res) => {
    const { id } = req.params;
    const revisions = readJsonFile(STUDIO_REVISIONS_FILE, []);
    const target = revisions.find((r: any) => r.id === id);
    if (!target) return res.status(404).json({ error: "Revision not found" });

    writeJsonFile(STUDIO_PUBLISHED_FILE, target.dataSnapshot);
    writeJsonFile(STUDIO_DRAFT_FILE, target.dataSnapshot);

    res.json({ success: true, message: `Restored revision ${id}`, data: target.dataSnapshot });
  });

  // Media Library
  app.get("/api/studio/media", (_req, res) => {
    const media = readJsonFile(STUDIO_MEDIA_FILE, []);
    res.json({ success: true, media });
  });

  app.post("/api/studio/media", (req, res) => {
    const { item } = req.body;
    if (!item || !item.url) return res.status(400).json({ error: "Media item with url required" });
    const mediaList = readJsonFile(STUDIO_MEDIA_FILE, []);
    const newItem = {
      id: item.id || `media_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: item.title || "Uploaded Image",
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || item.url,
      caption: item.caption || "",
      alt: item.alt || item.title || "",
      category: item.category || "General",
      format: item.format || "image",
      size: item.size || "Unknown",
      dimensions: item.dimensions || "1920x1080",
      createdAt: new Date().toISOString()
    };
    mediaList.unshift(newItem);
    writeJsonFile(STUDIO_MEDIA_FILE, mediaList);
    res.json({ success: true, item: newItem });
  });

  app.delete("/api/studio/media/:id", (req, res) => {
    const { id } = req.params;
    const mediaList = readJsonFile(STUDIO_MEDIA_FILE, []);
    const filtered = mediaList.filter((m: any) => m.id !== id);
    writeJsonFile(STUDIO_MEDIA_FILE, filtered);
    res.json({ success: true });
  });

  // Real Analytics Tracking
  interface AnalyticsEvent {
    id: string;
    timestamp: string;
    date: string;
    type: 'pageview' | 'project_click' | 'contact_submit' | 'cv_download' | 'section_view';
    path: string;
    label?: string;
    device: 'desktop' | 'mobile' | 'tablet';
    referrer?: string;
  }

  app.post("/api/studio/analytics/track", (req, res) => {
    const { type, path: eventPath, label, device, referrer } = req.body;
    const events: AnalyticsEvent[] = readJsonFile(STUDIO_ANALYTICS_FILE, []);
    const now = new Date();
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split("T")[0],
      type: type || 'pageview',
      path: eventPath || '/',
      label: label || '',
      device: device || 'desktop',
      referrer: referrer || 'direct'
    };
    events.unshift(event);
    // Keep last 5000 events
    if (events.length > 5000) events.pop();
    writeJsonFile(STUDIO_ANALYTICS_FILE, events);
    res.json({ success: true });
  });

  // Reset Analytics endpoint
  app.post("/api/studio/analytics/reset", (_req, res) => {
    try {
      writeJsonFile(STUDIO_ANALYTICS_FILE, []);
      res.json({ success: true, message: "Analytics history reset to zero" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to reset analytics" });
    }
  });

  app.get("/api/studio/analytics", (_req, res) => {
    const events: AnalyticsEvent[] = readJsonFile(STUDIO_ANALYTICS_FILE, []);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const todayEvents = events.filter(e => e.date === todayStr);
    const last7DaysEvents = events.filter(e => e.date >= sevenDaysAgo);
    const last30DaysEvents = events.filter(e => e.date >= thirtyDaysAgo);

    // Visits by date for the chart
    const dailyCounts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      dailyCounts[d] = 0;
    }
    for (const e of last7DaysEvents) {
      if (e.type === 'pageview') {
        dailyCounts[e.date] = (dailyCounts[e.date] || 0) + 1;
      }
    }

    // Devices
    const devices: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    for (const e of events) {
      if (devices[e.device] !== undefined) devices[e.device]++;
      else devices.desktop++;
    }

    // Top pages / sections
    const pageCounts: Record<string, number> = {};
    for (const e of events) {
      const p = e.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }

    // Top projects clicked
    const projectClicks: Record<string, number> = {};
    for (const e of events) {
      if (e.type === 'project_click' && e.label) {
        projectClicks[e.label] = (projectClicks[e.label] || 0) + 1;
      }
    }

    // Referrers
    const referrers: Record<string, number> = {};
    for (const e of events) {
      const ref = e.referrer || 'direct';
      referrers[ref] = (referrers[ref] || 0) + 1;
    }

    res.json({
      success: true,
      summary: {
        totalEvents: events.length,
        totalPageViews: events.filter(e => e.type === 'pageview').length,
        todayPageViews: todayEvents.filter(e => e.type === 'pageview').length,
        sevenDaysPageViews: last7DaysEvents.filter(e => e.type === 'pageview').length,
        thirtyDaysPageViews: last30DaysEvents.filter(e => e.type === 'pageview').length,
        contactSubmissions: events.filter(e => e.type === 'contact_submit').length,
        cvDownloads: events.filter(e => e.type === 'cv_download').length
      },
      dailyTrend: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })),
      devices,
      topPages: Object.entries(pageCounts).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 8),
      topProjects: Object.entries(projectClicks).map(([name, clicks]) => ({ name, clicks })).sort((a, b) => b.clicks - a.clicks).slice(0, 8),
      referrers: Object.entries(referrers).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 6)
    });
  });

  // Get current Webhook URL status
  app.get("/api/sheets/webhook", (_req, res) => {
    res.json({
      success: true,
      webhookUrl: serverWebhookUrl,
      webhookConfigured: !!serverWebhookUrl
    });
  });

  // Save/configure Webhook URL
  app.post("/api/sheets/webhook", (req, res) => {
    const { webhookUrl } = req.body;
    serverWebhookUrl = webhookUrl ? webhookUrl.trim() : null;
    saveWebhook(serverWebhookUrl);
    res.json({ success: true, webhookConfigured: !!serverWebhookUrl, webhookUrl: serverWebhookUrl });
  });

  // Test Webhook URL with a sample ping
  app.post("/api/sheets/webhook/test", async (req, res) => {
    const targetUrl = req.body.webhookUrl || serverWebhookUrl;
    if (!targetUrl) {
      return res.status(400).json({ error: "No Google Sheets Webhook URL configured. Please paste your Google Apps Script Web App URL first." });
    }

    const testPayload = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { timeZoneName: "short" }),
      firstName: "Test",
      lastName: "Sync",
      email: "nihal.graphix@gmail.com",
      phone: "+1 555-0199",
      country: "System Test",
      message: "⚡ Google Sheets integration connection test successfully verified!"
    };

    try {
      const gRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(testPayload),
        redirect: "follow"
      });

      if (gRes.ok) {
        return res.json({ success: true, message: "Test payload sent to Google Sheets successfully! Check your spreadsheet." });
      } else {
        return res.status(500).json({ error: `Google Apps Script returned status ${gRes.status}` });
      }
    } catch (err: any) {
      console.error("Webhook test failed:", err);
      return res.status(500).json({ error: err?.message || "Failed to post to Google Sheets Webhook URL" });
    }
  });

  // Contact Submission Route
  app.post("/api/contact", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, country, message, spreadsheetId, accessToken, webhookUrl } = req.body;
      if (!email || !message) {
        return res.status(400).json({ error: "Email and message are required." });
      }

      const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });
      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp,
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        phone: phone || "",
        country: country || "",
        message: message || ""
      };

      messagesStore.unshift(newMsg);
      saveMessages();

      const targetEmail = "nihal.graphix@gmail.com";
      const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Portfolio Visitor";

      let sheetAppended = false;

      // 1. Dispatch to FormSubmit AJAX endpoint for direct email delivery
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
        console.warn("FormSubmit email dispatch error:", fErr);
      }

      // 2. If Google Apps Script Webhook URL is configured, post to Google Sheets
      const targetWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || webhookUrl || serverWebhookUrl;
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

          // Dispatch with JSON body and URL query parameters (text/plain avoids CORS preflight and allows JSON.parse in GAS)
          let wRes = await fetch(urlWithQuery, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(fullPayload),
            redirect: "follow"
          });

          if (wRes.ok) {
            sheetAppended = true;
            console.log("Successfully posted message to Google Sheets Webhook URL");
          } else {
            // Fallback to URL-encoded form body
            await fetch(urlWithQuery, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: formParams.toString(),
              redirect: "follow"
            });
            sheetAppended = true;
          }
        } catch (wErr) {
          console.error("Error posting to Google Sheets Webhook URL:", wErr);
        }
      }

      // 3. If client supplied Google OAuth Access Token & Spreadsheet ID, append via Google Sheets REST API
      if (!sheetAppended && spreadsheetId && accessToken) {
        try {
          const rowValues = [
            timestamp,
            firstName || "",
            lastName || "",
            email || "",
            phone || "",
            country || "",
            message || ""
          ];

          const sheetsRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:G:append?valueInputOption=USER_ENTERED`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ values: [rowValues] })
            }
          );
          if (sheetsRes.ok) {
            sheetAppended = true;
            console.log("Successfully appended contact message to Google Sheet:", spreadsheetId);
          }
        } catch (sheetErr) {
          console.error("Server Google Sheet REST API append error:", sheetErr);
        }
      }

      return res.json({
        success: true,
        sheetAppended,
        messageCount: messagesStore.length,
        message: "Message successfully submitted and recorded."
      });
    } catch (error: any) {
      console.error("Error handling contact form submission:", error);
      return res.json({
        success: true,
        message: "Message received successfully."
      });
    }
  });

  // --- GALLERY LIKES ENDPOINTS ---
  const GALLERY_LIKES_FILE = path.join(DATA_DIR, "gallery_likes.json");
  app.get("/api/gallery/likes", (_req, res) => {
    const likesMap = readJsonFile(GALLERY_LIKES_FILE, {});
    res.json({ success: true, likes: likesMap });
  });

  app.post("/api/gallery/:id/like", (req, res) => {
    const { id } = req.params;
    const likesMap = readJsonFile(GALLERY_LIKES_FILE, {});
    likesMap[id] = (likesMap[id] || 0) + 1;
    writeJsonFile(GALLERY_LIKES_FILE, likesMap);
    res.json({ success: true, id, likes: likesMap[id] });
  });

  // --- BLOG LIKES & COMMENTS ENDPOINTS ---
  const BLOG_LIKES_FILE = path.join(DATA_DIR, "blog_likes.json");
  const BLOG_COMMENTS_FILE = path.join(DATA_DIR, "blog_comments.json");

  app.get("/api/blog/likes", (_req, res) => {
    const likesMap = readJsonFile(BLOG_LIKES_FILE, {});
    res.json({ success: true, likes: likesMap });
  });

  app.post("/api/blog/:id/like", (req, res) => {
    const { id } = req.params;
    const likesMap = readJsonFile(BLOG_LIKES_FILE, {});
    likesMap[id] = (likesMap[id] || 0) + 1;
    writeJsonFile(BLOG_LIKES_FILE, likesMap);
    res.json({ success: true, id, likes: likesMap[id] });
  });

  app.get("/api/blog/:id/comments", (req, res) => {
    const { id } = req.params;
    const allComments = readJsonFile(BLOG_COMMENTS_FILE, {});
    const postComments = allComments[id] || [];
    res.json({ success: true, comments: postComments });
  });

  app.post("/api/blog/:id/comments", (req, res) => {
    const { id } = req.params;
    const { name, text, email } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    const allComments = readJsonFile(BLOG_COMMENTS_FILE, {});
    if (!allComments[id]) allComments[id] = [];
    const newComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name && name.trim() ? name.trim() : "Anonymous Designer",
      email: email || "",
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name || 'user')}`,
      text: text.trim(),
      timestamp: "Just now",
      likes: 0
    };
    allComments[id].unshift(newComment);
    writeJsonFile(BLOG_COMMENTS_FILE, allComments);
    res.json({ success: true, comment: newComment });
  });

  // --- SERVICE INQUIRY ENDPOINT ---
  app.post("/api/services/inquire", (req, res) => {
    const { serviceTitle, scope, budget, name, email, details } = req.body;
    const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });
    const newMsg = {
      id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      firstName: name || "Prospective Client",
      lastName: `[${serviceTitle || "Service"}]`,
      email: email || "",
      phone: budget || "Custom Budget",
      country: scope || "2-4 Weeks",
      message: `[SERVICE INQUIRY: ${serviceTitle || "General"}]\nTimeline/Scope: ${scope || "Flexible"}\nBudget: ${budget || "Negotiable"}\n\nClient Details:\n${details || "Interested in starting a project."}`
    };
    messagesStore.unshift(newMsg);
    saveMessages();
    res.json({ success: true, message: "Service inquiry submitted successfully!", inquiry: newMsg });
  });

  // Gemini AI Concierge / Assistant route
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          response: "NIHAL AI Assistant (Demo Mode): I am Nihal . ON's AI design agent! Nihal is a Senior Creative Technologist specializing in Cyberpunk aesthetic, Framer Motion, GSAP, and Next.js applications with 6+ years of experience. How can I assist your project today?"
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are NIHAL AI, the ultra-sophisticated AI Design Assistant & Project Concierge for Nihal . ON's award-winning portfolio.
Nihal . ON is a Lead Creative Director, Full Stack Technologist & Cyberpunk/Editorial Designer with 6+ years experience, 150+ completed projects, and a 98% client satisfaction rate.
Nihal's skills include: React 19, Next.js, TypeScript, Tailwind CSS, GSAP, Framer Motion, Three.js, Figma, Brand Identity, and AI Integrations.
Nihal's services include: UI/UX Design, Web Design, Frontend Engineering, Brand Identity, Motion Design, Framer Development, and AI System Design.

Answer queries professionally, concisely, with a sleek, intelligent, tech-luxury tone. You can suggest scheduling a discovery call, reviewing featured case studies (like 'Aetheria AI', 'Fluxora Cloud', 'Luminary Fashion', 'Vortex OS'), or inquiring about pricing and project timelines. Keep responses engaging and structured.`;

      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          contents.push({ role: item.role === 'user' ? 'user' : 'model', parts: [{ text: item.content }] });
        }
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ response: response.text || "I'm ready to discuss Nihal . ON's work or project availability." });
    } catch (error: any) {
      console.error("Error in AI Assistant API:", error);
      res.status(500).json({ error: "Failed to generate AI response", details: error?.message });
    }
  });

  // Vite middleware in dev vs static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
