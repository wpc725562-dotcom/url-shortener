/**
 * URL Shortener - Server
 * A simple URL shortener built with Node.js + Express.
 *
 * Features:
 * - POST /api/shorten  -> create a short link from a long URL
 * - GET  /:code        -> redirect to the original URL
 * - GET  /api/stats    -> list all shortened links (with click counts)
 * - Data persisted in a JSON file (data.json)
 *
 * No database needed - perfect for learning or small projects.
 */

"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ---------- Data layer (JSON file storage) ----------

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return {}; // file missing or empty -> start fresh
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ---------- Helpers ----------

/** Generate a short, unique code (6 chars from a-z, 0-9). */
function generateCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Basic URL validation: must start with http:// or https:// */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
}

// ---------- Middleware ----------

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Routes ----------

/**
 * Create a short link.
 * Body: { "url": "https://example.com/some/very/long/path" }
 * Response: { "shortUrl": "http://localhost:3000/abc123", "code": "abc123" }
 */
app.post("/api/shorten", (req, res) => {
  const { url } = req.body || {};

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Please provide a valid URL starting with http:// or https://" });
  }

  const data = loadData();

  // Reuse existing code if the same URL was shortened before
  const existing = Object.keys(data).find((code) => data[code].url === url);
  if (existing) {
    return res.json({ shortUrl: `${BASE_URL}/${existing}`, code: existing });
  }

  // Generate a unique code (retry on collision)
  let code = generateCode();
  while (data[code]) {
    code = generateCode();
  }

  data[code] = { url, clicks: 0, createdAt: new Date().toISOString() };
  saveData(data);

  res.json({ shortUrl: `${BASE_URL}/${code}`, code });
});

/**
 * Redirect a short code to its original URL.
 * Example: GET /abc123  ->  302 redirect to the long URL
 */
app.get("/:code", (req, res) => {
  const { code } = req.params;
  const data = loadData();
  const entry = data[code];

  if (!entry) {
    return res.status(404).send("Link not found. Create one at the homepage.");
  }

  // Count the click
  entry.clicks += 1;
  saveData(data);

  res.redirect(301, entry.url);
});

/**
 * Stats endpoint: list all links with click counts.
 * Useful for debugging and for the homepage table.
 */
app.get("/api/stats", (req, res) => {
  const data = loadData();
  const list = Object.keys(data).map((code) => ({
    code,
    url: data[code].url,
    clicks: data[code].clicks,
    createdAt: data[code].createdAt,
  }));
  res.json(list);
});

// ---------- Start ----------

app.listen(PORT, () => {
  console.log(`✅ URL Shortener running at ${BASE_URL}`);
});
