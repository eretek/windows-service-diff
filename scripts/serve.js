#!/usr/bin/env node
// Minimal static file server for local use: node scripts/serve.js [port]
// Serves this repository on http://127.0.0.1:<port>/ (default 8080). No dependencies.
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), PORT = Number(process.argv[2] || process.env.PORT || 8080);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };
http.createServer((req, res) => {
	let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	if (p.endsWith('/')) p += 'index.html';
	const f = path.resolve(ROOT, '.' + p);
	if (!f.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
	fs.readFile(f, (err, data) => {
		if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
		res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
		res.end(data);
	});
}).listen(PORT, '127.0.0.1', () => console.log(`Open http://127.0.0.1:${PORT}/  (add ?lang=tr or ?lang=de for other languages)`));
