import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => res.send("Hello from Express backend!"));

app.get("/health", (req, res) => res.json({ ok: true, time: Date.now() }));

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});