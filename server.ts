import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "15mb" }));

  // In-memory store for emergency session audio snippets
  const emergencyAudioSnippets: Record<string, any[]> = {};

  // Silent Panic Audio Snippet Auto-Upload Route
  app.post("/api/emergency-audio-snippet", (req, res) => {
    const { alertId, snippetId, timestamp, durationSeconds, audioBase64, sizeBytes } = req.body;
    if (!alertId) {
      return res.status(400).json({ error: "alertId is required" });
    }

    if (!emergencyAudioSnippets[alertId]) {
      emergencyAudioSnippets[alertId] = [];
    }

    const snippet = {
      id: snippetId || `SNIP-${Date.now()}`,
      alertId,
      timestamp: timestamp || Date.now(),
      durationSeconds: durationSeconds || 5,
      audioBase64: audioBase64 || null,
      sizeBytes: sizeBytes || (audioBase64 ? audioBase64.length : 0),
      uploadedAt: Date.now()
    };

    emergencyAudioSnippets[alertId].push(snippet);

    console.log(
      `\n[SILENT PANIC AUTO-UPLOAD] Alert: ${alertId} | Snippet: ${snippet.id} (${snippet.durationSeconds}s, ~${Math.round(snippet.sizeBytes / 1024)} KB) | Total Recorded: ${emergencyAudioSnippets[alertId].length}`
    );

    return res.json({
      success: true,
      snippetId: snippet.id,
      uploadedAt: snippet.uploadedAt,
      totalSnippets: emergencyAudioSnippets[alertId].length
    });
  });

  // Get snippets for an emergency session (for Police Station Controller & User Dashboard)
  app.get("/api/emergency-audio-snippets/:alertId", (req, res) => {
    const snippets = emergencyAudioSnippets[req.params.alertId] || [];
    return res.json({
      alertId: req.params.alertId,
      count: snippets.length,
      snippets
    });
  });

  // API Route to notify emergency contacts
  app.post("/api/notify-contacts", (req, res) => {
    const { contacts, message } = req.body;
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: "Invalid contacts array" });
    }
    console.log(`\n[EMERGENCY ALERT] Sending SMS to ${contacts.length} contacts...`);
    contacts.forEach((c: any) => {
      console.log(` -> To: ${c.name} (${c.phone})\n -> Message: ${message}`);
    });
    // In a real app, integrate Twilio/AWS SNS here.
    return res.json({ success: true, deliveredCount: contacts.length });
  });

  // Gemini Proxy Route
  app.post("/api/safety-guidance", async (req, res) => {
    const { prompt, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });
      
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are a Women's Safety Assistant for the "নির্ভয়া সাথী (Nirbhoya Sathi)" platform. 
          Your goal is to provide safety guidance, legal awareness, and emergency support instructions in ${language}. 
          Keep responses concise, supportive, and practical. 
          If the user is in immediate danger, advise them to use the SOS button or call 112 immediately.`
        }
      });

      res.json({ text: result.text || "" });
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // Direct ZIP download route for owner / deployment
  app.get(
    [
      "/nirbhaya_sathi_deploy.zip",
      "/nirbhaya-sathi-latest.zip",
      "/nirbhaya_free2host_ready.zip",
      "/nirbhaya_sathi_complete.zip",
      "/api/download-zip",
      "/download-zip",
      "/project.zip",
      "/download.zip"
    ],
    (req, res) => {
      const distZipPath = path.join(process.cwd(), "dist", "nirbhaya_sathi_deploy.zip");
      const publicZipPath = path.join(process.cwd(), "public", "nirbhaya_sathi_deploy.zip");

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="nirbhaya_sathi_deploy.zip"');

      // If prebuilt ZIP exists, stream it directly
      if (fs.existsSync(distZipPath)) {
        return res.sendFile(distZipPath);
      } else if (fs.existsSync(publicZipPath)) {
        return res.sendFile(publicZipPath);
      }

      return res.status(404).json({ error: "Deploy package not generated or not available" });
    }
  );

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support both Express 4 and Express 5 SPA fallback without path-to-regexp errors
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
