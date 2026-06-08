const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Backend rodando!');
});

server.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});