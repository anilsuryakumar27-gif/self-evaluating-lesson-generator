/**
 * Lightweight Local Web Server & API for the Interactive Dashboard
 * Zero external dependencies (uses native Node.js HTTP and FileSystem).
 */

import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ContentLoopOrchestrator } from '../src/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API endpoint: Run the Agentic Loop
  if (req.method === 'POST' && pathname === '/api/run') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const topic = payload.topic || 'Introduction to RAG';

        const events = [];
        const orchestrator = new ContentLoopOrchestrator({
          onProgress: (evt) => {
            events.push({ ...evt, timestamp: Date.now() });
          }
        });

        const result = await orchestrator.runLoop(topic);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          events,
          result
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API endpoint: Get Latest Shipped Lesson & Audit Trail
  if (req.method === 'GET' && pathname === '/api/data') {
    try {
      const lessonPath = path.resolve('lessons', 'introduction_to_rag.md');
      const auditPath = path.resolve('lessons', 'audit_trail_introduction_to_rag.json');

      const lesson = await fs.readFile(lessonPath, 'utf8');
      const audit = JSON.parse(await fs.readFile(auditPath, 'utf8'));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, lesson, audit }));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`  🚀 Web Dashboard Running at http://localhost:${PORT}`);
  console.log(`  Interactive GenAI Content Systems Evaluation Console`);
  console.log(`============================================================\n`);
});
