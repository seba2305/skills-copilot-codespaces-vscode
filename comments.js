// Create web server
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { addComment, getComments } = require('./comments');
const { createCommentHtml } = require('./commentHtml');

const port = 3000;

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  if (pathname === '/comment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { name, comment } = JSON.parse(body);
      await addComment(name, comment);
      res.end();
    });
  } else if (pathname === '/comments' && req.method === 'GET') {
    const comments = await getComments();
    const commentsHtml = comments.map(createCommentHtml).join('');
    res.end(commentsHtml);
  } else {
    const file = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(__dirname, 'public', file);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpg',
        }[ext];
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
