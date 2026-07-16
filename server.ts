/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";

const RADIO_BROWSER_BASE = "https://de1.api.radio-browser.info/json";

async function startServer() {
  const app  = express();
  const PORT = Number(process.env.PORT) || 5000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/health", (_, res) => res.json({ 
    status: "ok",
    service: "Radio Wave Brasil API",
    version: "1.0.0"
  }));

  // Radio Browser API Endpoints
  
  // Search stations (Always filters for Brazil)
  app.get("/api/stations/search", async (req, res) => {
    try {
      const { name, tag, state, limit = 20, offset = 0 } = req.query;
      const limitNum = Number(limit);
      const offsetNum = Number(offset);

      const params = new URLSearchParams();
      if (name) params.append("name", name as string);
      if (tag) params.append("tag", tag as string);
      if (state) params.append("state", state as string);
      
      params.append("country", "Brazil"); // Strict Brazil requirement
      // Radio Browser has no cheap "count matching this filter" endpoint, so we
      // can't ask it for an exact total up front. Instead we ask for one extra
      // item beyond this page (limit + 1): if it comes back, we know there's at
      // least one more page and report a total that reveals exactly one more
      // page; if it doesn't, this page is the true end and we report the exact
      // total. This keeps pagination always pointing at real data — no more
      // guessed/fixed totals sending users to empty "last pages".
      params.append("limit", String(limitNum + 1));
      params.append("offset", offset as string);
      params.append("order", "votes");
      params.append("reverse", "true");
      params.append("hidebroken", "true");

      const response = await fetch(`${RADIO_BROWSER_BASE}/stations/search?${params}`, {
        headers: { 'User-Agent': 'RadioWaveBrasil/1.0' }
      });
      
      if (!response.ok) {
        throw new Error(`Radio Browser API responded with status ${response.status}`);
      }
      
      const rawStations = await response.json();
      const hasMore = Array.isArray(rawStations) && rawStations.length > limitNum;
      const stations = hasMore ? rawStations.slice(0, limitNum) : rawStations;

      res.json({
        success: true,
        data: stations,
        total: offsetNum + stations.length + (hasMore ? 1 : 0)
      });
    } catch (error: any) {
      console.warn("⚠️ Search Error:", error.message);
      res.json({ 
        success: false, 
        data: [], 
        total: 0,
        error: "Erro ao buscar estações brasileiras."
      });
    }
  });

  // Brazil top stations (Ordered by votes)
  app.get("/api/stations/brazil", async (req, res) => {
    try {
      const { limit = 24, offset = 0 } = req.query;
      const limitNum = Number(limit);
      const offsetNum = Number(offset);

      // Same "probe one extra item" technique as /stations/search: Radio
      // Browser has no fast exact count for a given country, so guessing a
      // fixed total (e.g. an approximate station count) produces phantom
      // pages once the real, filtered (hidebroken) list runs out — clicking
      // into them returns nothing. Asking for limit+1 tells us exactly
      // whether another page exists without guessing.
      const response = await fetch(`${RADIO_BROWSER_BASE}/stations/bycountry/Brazil?limit=${limitNum + 1}&offset=${offsetNum}&order=votes&reverse=true&hidebroken=true`, {
        headers: { 'User-Agent': 'RadioWaveBrasil/1.0' }
      });
      
      if (!response.ok) {
        throw new Error(`Radio Browser API responded with status ${response.status}`);
      }
      
      const rawData = await response.json();
      const hasMore = Array.isArray(rawData) && rawData.length > limitNum;
      const data = hasMore ? rawData.slice(0, limitNum) : rawData;

      res.json({
        success: true,
        data,
        total: offsetNum + data.length + (hasMore ? 1 : 0)
      });
    } catch (error: any) {
      console.warn("⚠️ Brazil Stations Error:", error.message);
      res.json({ 
        success: false, 
        data: [], 
        total: 0,
        error: "Erro ao carregar rádios populares do Brasil."
      });
    }
  });

  // Alias for radioService compatibility
  app.get("/api/stations/bycountry/Brazil", async (req, res) => {
    const { limit, offset } = req.query;
    res.redirect(`/api/stations/brazil?limit=${limit || 24}&offset=${offset || 0}`);
  });

  // Tags (Popular tags)
  app.get("/api/tags", async (req, res) => {
    try {
      const { limit = 30 } = req.query;
      
      const response = await fetch(`${RADIO_BROWSER_BASE}/tags?limit=${limit}&order=stationcount&reverse=true&hidebroken=true`, {
        headers: { 'User-Agent': 'RadioWaveBrasil/1.0' }
      });
      
      if (!response.ok) {
        throw new Error(`Radio Browser API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      res.json({
        success: true,
        data: data,
        total: data.length
      });
    } catch (error: any) {
      console.warn("⚠️ Tags Error:", error.message);
      res.json({ 
        success: false, 
        data: [], 
        total: 0,
        error: "Erro ao carregar gêneros."
      });
    }
  });

  // Audio Proxy to bypass Mixed Content (HTTP on HTTPS)
  app.get("/api/proxy-audio", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("URL is required");
    }

    try {
      const axios = (await import("axios")).default;
      const https = await import("https");
      const http = await import("http");

      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        // @ts-ignore
        insecureHTTPParser: true,
        keepAlive: true,
      });
      const httpAgent = new http.Agent({
        // @ts-ignore
        insecureHTTPParser: true,
        keepAlive: true,
      });

      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        timeout: 0,           // No timeout — live streams run indefinitely
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Icy-MetaData': '1',
          'Connection': 'keep-alive',
        },
        maxRedirects: 10,
        // Treat any HTTP status as "resolved" so we can inspect it ourselves —
        // otherwise axios throws on 4xx/5xx and we lose the chance to report a
        // clean 502 (letting the player retry/show "Sem Sinal") instead of an
        // opaque network error.
        validateStatus: () => true,
        // @ts-ignore
        insecureHTTPParser: true,
        httpsAgent,
        httpAgent,
      });

      // A dead/misconfigured station (offline server, wrong path, blocked IP,
      // etc.) often still answers with a 200 + an HTML error page rather than
      // a clean 4xx/5xx. Piping that to <audio> just hangs with no clear
      // error, which is exactly the silent "Sem Sinal" case we want to avoid —
      // fail fast with a proper 502 so the retry logic kicks in immediately.
      const rawContentType = String(response.headers['content-type'] || '').toLowerCase();
      const looksLikeHtmlError = rawContentType.includes('text/html') || rawContentType.includes('text/plain');
      if (response.status >= 400 || (response.status !== 200 && looksLikeHtmlError)) {
        response.data?.destroy?.();
        return res.status(502).send('Upstream stream unavailable');
      }

      let contentType = response.headers['content-type'];
      if (typeof contentType !== 'string' || !contentType) {
        contentType = 'audio/mpeg';
      }
      const lowerContentType = contentType.toLowerCase();
      // Some Shoutcast/Icecast servers report "audio/aacp" (HE-AAC/aacPlus).
      // Browsers' <audio> element frequently fails to decode that MIME (stream
      // stalls/stops after a second or two), but the same raw ADTS AAC data
      // plays fine when labeled "audio/aac". Normalize it so playback is stable.
      if (lowerContentType.includes('aacp')) {
        contentType = 'audio/aac';
      } else if (lowerContentType.includes('mpegurl')) {
        // HLS manifests requested through the proxy (mixed-content HTTP HLS) —
        // normalize both "application/x-mpegurl" and "audio/x-mpegurl" variants
        // to the standard MIME so hls.js's loader handles them consistently.
        contentType = 'application/vnd.apple.mpegurl';
      } else if (lowerContentType.includes('dash+xml')) {
        contentType = 'application/dash+xml';
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store');
      res.setHeader('X-Accel-Buffering', 'no');   // Disable nginx buffering if present
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Content-Type', contentType);

      response.data.pipe(res);

      // Clean up upstream when the browser disconnects
      req.on('close', () => {
        response.data.destroy();
      });
      req.on('aborted', () => {
        response.data.destroy();
      });

      response.data.on('error', (err: any) => {
        console.error('Proxy Stream Error:', err.message);
        if (!res.headersSent) res.status(502).end();
        else res.end();
      });

    } catch (error: any) {
      console.error("Proxy Error:", error.message);
      if (!res.headersSent) {
        res.status(502).send("Proxy Error: " + error.message);
      } else {
        res.end();
      }
    }
  });

  const httpServer = http.createServer(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Vite middleware...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: { server: httpServer } },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("✅ Vite middleware attached.");
    } catch (viteError) {
      console.error("❌ Failed to start Vite server:", viteError);
    }
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Radio Wave Brasil Backend running on http://localhost:${PORT}`);
  });
}

startServer();
