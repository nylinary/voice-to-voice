import express from "express";

const app = express();

app.use(express.text({ type: ["application/sdp", "text/plain"] }));
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY env var");

const ALLOWED_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

app.post("/session", async (req, res) => {
  try {
    const voice = String(req.query.voice || "marin");
    const safeVoice = ALLOWED_VOICES.has(voice) ? voice : "marin";

    const sessionConfig = JSON.stringify({
      type: "realtime",
      model: "gpt-realtime",
      audio: { output: { voice: safeVoice } },
    });

    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });

    if (!r.ok) {
      res.status(500).send(await r.text());
      return;
    }

    res.type("text/plain").send(await r.text());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create realtime call" });
  }
});

app.get("/health", (req, res) => res.status(200).send("ok"));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => console.log(`listening on ${PORT}`));