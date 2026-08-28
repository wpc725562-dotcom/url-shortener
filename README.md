# URL Shortener

A clean, fully-functional URL shortener built with **Node.js + Express**. No database needed — links are stored in a simple JSON file. Perfect as a learning project or a starting point for a bigger app.

## ✨ Features

- 🔗 Shorten any `http://` or `https://` URL in one click
- ⚡ Redirect with 301 (permanent) — SEO friendly
- 👀 Click counter for every link
- 📋 One-click copy button
- 📜 Recent links list (latest 8)
- 🗂️ Data persisted in `data.json` — survives server restart
- ✅ Input validation + friendly error messages
- 📱 Responsive front-end, clean modern UI

## 🖥️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in your browser
# http://localhost:3000
```

## 🔧 API

### Create a short link

```
POST /api/shorten
Content-Type: application/json

{ "url": "https://example.com/some/very/long/path" }
```

Response:

```json
{
  "shortUrl": "http://localhost:3000/abc123",
  "code": "abc123"
}
```

### Redirect

```
GET /:code      → 301 redirect to the original URL
```

### List all links

```
GET /api/stats
```

Response:

```json
[
  {
    "code": "abc123",
    "url": "https://example.com/some/very/long/path",
    "clicks": 3,
    "createdAt": "2026-08-28T08:00:00.000Z"
  }
]
```

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Node.js + Express |
| Storage  | JSON file (zero setup, swap for SQLite/Redis later) |
| Frontend | Vanilla HTML/CSS/JS (no framework) |

## 📁 Project Structure

```
url-shortener/
├── server.js        # Express app: routes, storage, redirect logic
├── package.json     # Dependencies & scripts
├── data.json        # Auto-created at runtime (links storage)
└── public/
    ├── index.html   # Front-end page
    ├── style.css    # Styling
    └── app.js       # Front-end logic (fetch API)
```

## 🚀 Possible Extensions

- Custom short codes (e.g. `/my-custom-name`)
- QR code generation for links
- Link expiration dates
- Password-protected links
- Analytics dashboard (charts)
- Swap JSON file for SQLite / MongoDB

## 📄 License

MIT — free to use and modify.

---

*Built with ❤️ as a clean full-stack demo (Node.js + Express + vanilla JS).*
