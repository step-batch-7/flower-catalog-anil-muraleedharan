const { existsSync, mkdirSync } = require('fs');

const setUpDataDir = function(dataDirPath) {
  if (!existsSync(`${dataDirPath}`)) {
    mkdirSync(`${dataDirPath}`);
  }
};

module.exports = setUpDataDir;
