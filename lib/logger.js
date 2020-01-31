const networkInterfaces = require('os').networkInterfaces();
const { stdout } = require('process');

const showBeginMessage = port => {
  const myIpPosition = 1;
  const serverIp = networkInterfaces['en0'][myIpPosition].address;
  stdout.write(
    [
      'Serving HTTP on',
      `${serverIp} port ${port}`,
      `(http://${serverIp}:${port}/)\n`
    ].join(' ')
  );
};

module.exports = { showBeginMessage };
