# GSAS Agentic AI backend

This folder keeps the OpenAI API key off the public GitHub Pages frontend.

## 1. Deploy the backend
Use any Node.js host (for example Render, Railway, Fly.io, Azure App Service, or a VPS).

Set environment variables:
- `OPENAI_API_KEY` — your secret API key
- `OPENAI_MODEL` — default in this package: `gpt-5.4`
- `ALLOWED_ORIGIN` — your public website origin, e.g. `https://gsasintl.com`
- `PORT` — normally supplied by the host

Run:
```bash
npm install
npm start
```

Check `https://YOUR-BACKEND/health`; it should return `{ "ok": true }`.

## 2. Connect the website
Open `config.js` and set:
```js
window.GSAS_AI_API_URL = "https://YOUR-BACKEND";
```
Commit and deploy the website again.

If the backend is unavailable or the URL is blank, the site automatically falls back to the built-in guided assistant, so WhatsApp/email/phone routing still works.

## Security
Never place `OPENAI_API_KEY` in `config.js`, `script.js`, GitHub Pages settings, HTML, or any browser-delivered file.
