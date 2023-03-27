// app.js
const fs = require('fs');
const csvParser = require('csv-parser');
const balanceChecker = require('./balance_checker');

const tokens = {
  ethereum: {
    usdt: require('./abis_module/ethereum/usdt'),
    usdc: require('./abis_module/ethereum/usdc'),
    weth: require('./abis_module/ethereum/weth'),
    dai: require('./abis_module/ethereum/dai')
  },
  arbitrum: {
    arb: require('./abis_module/arbitrum/arb'),
    usdc: require('./abis_module/arbitrum/usdc'),
    dai: require('./abis_module/arbitrum/dai'),
    magic: require('./abis_module/arbitrum/magic'),
    stg: require('./abis_module/arbitrum/stg'),
    weth: require('./abis_module/arbitrum/weth')
  }
};

async function readAddressesFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    const addresses = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        addresses.push(row.address);
      })
      .on('end', () => {
        resolve(addresses);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

(async () => {
  try {
    const targetAddresses = await readAddressesFromCSV('addresses.csv');
    const result = await balanceChecker.getBalances(targetAddresses, tokens);
    console.log('查询结果：\n', result);

    // 在这里，您可以使用查询结果进行其他操作，如将其保存到数据库或发送到客户端等。
  } catch (error) {
    console.error('从CSV文件读取地址时出错：', error);
  }
})();
