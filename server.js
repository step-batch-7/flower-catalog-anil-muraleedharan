const http = require('http');
const { app } = require('./lib/handler');
const { showBeginMessage } = require('./lib/logger');

const defaultPort = 3333;

const main = function(port = defaultPort) {
  const server = new http.Server(app.serve.bind(app));
  server.listen(port, showBeginMessage.bind(null, port));
};

const portNumPosition = 2;
main(process.argv[portNumPosition]);
