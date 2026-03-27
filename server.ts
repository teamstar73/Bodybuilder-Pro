import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy for Open Food Facts Search
  app.get("/api/food/search", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query as string)}&search_simple=1&action=process&json=1&fields=product_name,nutriments,brands&lc=ja&cc=jp`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FitnessApp - Web - Version 1.0 - https://ais-dev-la5zz6jguqcstp4gj3p2sw-234181542968.asia-east1.run.app'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proxy search error:', error);
      res.status(500).json({ error: "Failed to fetch from Open Food Facts" });
    }
  });

  // Proxy for Open Food Facts Barcode
  app.get("/api/food/barcode/:barcode", async (req, res) => {
    const { barcode } = req.params;
    if (!barcode) return res.status(400).json({ error: "Missing barcode" });

    try {
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FitnessApp - Web - Version 1.0 - https://ais-dev-la5zz6jguqcstp4gj3p2sw-234181542968.asia-east1.run.app'
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Proxy barcode error:', error);
      res.status(500).json({ error: "Failed to fetch from Open Food Facts" });
    }
  });

  // Proxy for Edamam Food Database API
  app.get("/api/food/edamam", async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({ error: "Edamam API credentials not configured" });
    }

    try {
      const url = `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(query as string)}&app_id=${appId}&app_key=${appKey}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Edamam proxy error:', error);
      res.status(500).json({ error: "Failed to fetch from Edamam" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
