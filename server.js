const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; img-src 'self' data: https:; connect-src 'self' https://api.emailjs.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

const responseHeaders = (contentType, extras = {}) => ({
  ...SECURITY_HEADERS,
  'Content-Type': contentType,
  ...extras
});

const sendResponse = (req, res, statusCode, contentType, body, extras = {}) => {
  res.writeHead(statusCode, responseHeaders(contentType, extras));

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  if (Buffer.isBuffer(body)) {
    res.end(body);
    return;
  }

  res.end(body, 'utf8');
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendResponse(req, res, 405, 'text/plain; charset=utf-8', '405 Method Not Allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname = '/';

  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  } catch (error) {
    sendResponse(req, res, 400, 'text/plain; charset=utf-8', '400 Bad Request');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.join(ROOT_DIR, relativePath);

  // Get the file extension
  const extname = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Prevent path traversal attacks
  const safePath = path.resolve(filePath);
  if (safePath !== ROOT_DIR && !safePath.startsWith(`${ROOT_DIR}${path.sep}`)) {
    sendResponse(req, res, 403, 'text/plain; charset=utf-8', '403 Forbidden');
    return;
  }

  // Read the file
  fs.readFile(safePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Page not found
        fs.readFile(path.join(ROOT_DIR, '404.html'), (err, content) => {
          if (err) {
            sendResponse(req, res, 404, 'text/plain; charset=utf-8', '404 Not Found');
          } else {
            sendResponse(req, res, 404, MIME_TYPES['.html'], content);
          }
        });
      } else {
        // Server error
        sendResponse(req, res, 500, 'text/plain; charset=utf-8', `Server Error: ${err.code}`);
      }
    } else {
      // Success
      sendResponse(req, res, 200, contentType, content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});