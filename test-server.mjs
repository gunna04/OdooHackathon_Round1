import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!');
});

server.listen(8080, '127.0.0.1', () => {
  console.log('✅ Test server running on http://127.0.0.1:8080');
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
}); 