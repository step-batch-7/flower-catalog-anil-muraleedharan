const networkInterfaces = require('os').networkInterfaces();
const http = require('http');
const { existsSync, mkdirSync } = require('fs');
const { stdout } = require('process');
const { app } = require('./lib/handler');

const setUpDataDir = function(dataDirPath) {
  if (!existsSync(`${dataDirPath}`)) {
    mkdirSync(`${dataDirPath}`);
  }
};

const defaultPort = 3333;

const main = function(port = defaultPort) {
  const dataDirPath = `${__dirname}/data`;
  setUpDataDir(dataDirPath);
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
