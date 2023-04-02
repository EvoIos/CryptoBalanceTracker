const express = require('express');
const cors = require('cors');

const router = express.Router();
const balanceChecker = require('./balance_checker');

const authenticateToken = require('../middleware/authenticateToken');

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

// 允许跨域访问
router.use(cors());

router.get('/balances', cors(), authenticateToken, async (req, res) => {
  try {
    const targetAddresses = await balanceChecker.readAddressesFromCSV('./CryptoBalanceTracker/addresses.csv');
    const result = balanceChecker.getBalancesV1(targetAddresses, tokens);
    console.log('查询结果：\n', result);

    // 在这里，您可以使用查询结果进行其他操作，如将其保存到数据库或发送到客户端等。
    // res.json({result});

    // 将查询结果格式化为 JSON 字符串
    const jsonResult = JSON.stringify(result, null, '');

    // 将 JSON 字符串解析为 JavaScript 对象
    const parsedResult = JSON.parse(jsonResult);

    // 在这里，您可以使用查询结果进行其他操作，如将其保存到数据库或发送到客户端等。
    res.setHeader('Content-Type', 'application/json');
    res.send(parsedResult);

  } catch (error) {
    console.error('从CSV文件读取地址时出错：', error);
    res.status(500).json({error: '从CSV文件读取地址时出错'});
  }
});

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

module.exports = router;
