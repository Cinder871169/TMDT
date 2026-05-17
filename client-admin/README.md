SneakerZone Admin app

Run locally:

1. Install dependencies

```bash
cd client-admin
npm install
```

2. Start dev server

```bash
npm run dev
```

The admin app runs with Vite (default port 5173 or 5174). It uses the same API base as the main app (`VITE_API_BASE` env var or http://localhost:5000/).

Pages:

- /login — admin login (stores `adminUser` in sessionStorage)
- / — dashboard (protected, requires admin)
