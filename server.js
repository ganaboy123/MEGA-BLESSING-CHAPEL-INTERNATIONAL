const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3009;

const submissions = {
  newsletter: [],
  contact: [],
  give: []
};

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files first
app.use(express.static(path.join(__dirname)));

// Root route serves gateway.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "gateway.html"));
});

const isValidEmail = (email) => {
  if (typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mega-blessing-api" });
});

app.post("/api/newsletter", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Please provide a valid email address." });
  }

  submissions.newsletter.push({
    id: submissions.newsletter.length + 1,
    email,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ ok: true, message: "You are now subscribed to our newsletter." });
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const subject = String(req.body?.subject || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !subject || message.length < 10 || !isValidEmail(email)) {
    return res.status(400).json({
      ok: false,
      message: "Complete all fields with a valid email and message of at least 10 characters."
    });
  }

  submissions.contact.push({
    id: submissions.contact.length + 1,
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ ok: true, message: "Your message has been received. We will respond shortly." });
});

app.post("/api/give", (req, res) => {
  const name = String(req.body?.giverName || "").trim();
  const email = String(req.body?.giverEmail || "").trim().toLowerCase();
  const amount = Number(req.body?.amount);
  const cardLast4 = String(req.body?.cardLast4 || "").trim();

  if (!name || !isValidEmail(email) || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ ok: false, message: "Provide valid giver details and a donation amount above $0." });
  }

  submissions.give.push({
    id: submissions.give.length + 1,
    giverName: name,
    giverEmail: email,
    amount,
    cardLast4,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({
    ok: true,
    message: `Thank you for your generosity. Your donation of $${amount.toFixed(0)} has been recorded.`
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
