import express from "express";
import archiver from "archiver";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

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
      model: "gemini-1.5-flash",
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

// API Route to download the full project ZIP
app.get("/api/download-zip", (req, res) => {
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  res.attachment("nirbhaya-sathi-static.zip");

  archive.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  const distPath = path.join(process.cwd(), "dist");
  
  // Package the compiled HTML, CSS, JS from the dist folder
  archive.glob("**/*", {
    cwd: distPath,
    ignore: ["server.cjs", "server.cjs.map"],
  });

  archive.finalize();
});

export default app;
