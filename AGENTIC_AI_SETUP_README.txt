GSAS AGENTIC AI ASSISTANT - PHASE 2

The website now supports two modes:
1) AI mode: calls the secure Node.js backend in /ai-backend.
2) Guided fallback mode: works without a backend and still routes customers to WhatsApp, email, phone, services, quotation and contact pages.

TO ENABLE TRUE AI MODE
1. Deploy the /ai-backend folder on a Node.js hosting service.
2. Add OPENAI_API_KEY as a secret environment variable on that hosting service.
3. Set ALLOWED_ORIGIN=https://gsasintl.com (or your actual live website origin).
4. Copy the backend public URL.
5. In config.js set:
   window.GSAS_AI_API_URL = "https://YOUR-BACKEND";
6. Commit and redeploy the website.

DO NOT put the OpenAI API key into GitHub Pages frontend files.
