const networkInterfaces = require('os').networkInterfaces();
const http = require('http');
const fs = require('fs');
const { processRequest } = require('./app');

const setUpDataDir = function(dataDirPath) {
  if (!fs.existsSync(`${dataDirPath}`)) fs.mkdirSync(`${dataDirPath}`);
};

const main = function(port = 3333) {
  const dataDirPath = `${__dirname}/data`;
  setUpDataDir(dataDirPath);
  const serverIp = networkInterfaces['en0'][1].address;
  const server = new http.Server(processRequest);
  server.listen(port, () =>
    console.warn(
      [
        'Serving HTTP on',
        `${serverIp} port ${port}`,
        `(http://${serverIp}:${port}/)`
      ].join(' ')
    )
  );
};
main(process.argv[2]);
