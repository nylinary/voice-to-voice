import express from "express";

const app = express();

// Браузер будет POST-ить SDP offer как raw text
app.use(express.text({ type: ["application/sdp", "text/plain"] }));
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Set OPENAI_API_KEY env var");
}

// Конфиг realtime-сессии: модель + голос
const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime",
  audio: { output: { voice: "marin" } },
});

// Браузер шлёт SDP offer сюда, сервер создаёт call в OpenAI и возвращает SDP answer
app.post("/session", async (req, res) => {
  try {
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(500).send(errText);
      return;
    }

    const answerSdp = await r.text();
    res.type("text/plain").send(answerSdp);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create realtime call" });
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));