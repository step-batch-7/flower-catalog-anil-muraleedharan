const networkInterfaces = require('os').networkInterfaces();
const http = require('http');
const { stdout } = require('process');
const { app } = require('./lib/handler');

const defaultPort = 3333;

const main = function(port = defaultPort) {
  const myIpPosition = 1;
  const serverIp = networkInterfaces['en0'][myIpPosition].address;
  const server = new http.Server(app.serve.bind(app));
  server.listen(port, () =>
    stdout.write(
      [
        'Serving HTTP on',
        `${serverIp} port ${port}`,
        `(http://${serverIp}:${port}/)`
      ].join(' ')
    )
  );
};
const portNumPosition = 2;
main(process.argv[portNumPosition]);
