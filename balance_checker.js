const { web3 } = require('./web3_instance/etherum');
const arb_web3 = require('./web3_instance/arbitrum');
const fs = require('fs');
const csvParser = require('csv-parser');

// balance_checker.js
const initContracts = (web3Instance, tokenList) => {
    const contracts = {};
    for (const symbol in tokenList) {
      const token = tokenList[symbol];
      contracts[symbol] = new web3Instance.eth.Contract(token.abi, token.address);
    }
    return contracts;
  };
  
  async function getBalance(contract, symbol, targetAddress) {
    try {
      const balance = await contract.methods.balanceOf(targetAddress).call();
      const decimals = await contract.methods.decimals().call();
      const balanceInUsdt = balance / (10 ** decimals);
      return {
        symbol: symbol,
        amount: Number(balanceInUsdt.toFixed(5))
      };
    } catch (error) {
      console.error('查询余额时出错:', error);
      return null;
    }
  }
  
  async function checkBalances(contracts, targetAddresses) {
    const balancePromises = targetAddresses.map(async (targetAddress) => {
      const addressBalances = await Promise.all(
        Object.keys(contracts).map(async (symbol) => {
          return getBalance(contracts[symbol], symbol, targetAddress);
        })
      );
      return {
        address: targetAddress,
        balances: addressBalances.filter((balance) => balance !== null)
      };
    });
  
    return Promise.all(balancePromises);
  }
  
  async function getBalances(targetAddresses, tokens) {
    const ethereumContracts = initContracts(web3, tokens.ethereum);
    const arbitrumContracts = initContracts(arb_web3.web3, tokens.arbitrum);
  
    const [ethereumBalances, arbitrumBalances] = await Promise.all([
      checkBalances(ethereumContracts, targetAddresses),
      checkBalances(arbitrumContracts, targetAddresses)
    ]);
  
    /** json结构
     *  {{"address":"0x...","ethereum":[{"symbol":"usdt","amount":0}], "arbitrum":[{"symbol":"arb","amount":0} }] }
     */
    // const result = targetAddresses.map((address, index) => {
    //   return {
    //     address: address,
    //     ethereum: ethereumBalances[index].balances,
    //     arbitrum: arbitrumBalances[index].balances
    //   };
    // });

    /** json结构
     *  [
     *  { "address": "", "chain": "ethereum", "symbol_values": [{"usdc": 0}, {"usdt": 0}] },
     *  { "address": "", "chain": "arbitrum", "symbol_values": [{"usdc": 0}, {"usdt": 0}] }
     *  ]
     */
    const result = targetAddresses.flatMap((address, index) => {
      const ethereumBalancesObj = Object.fromEntries(
        ethereumBalances[index].balances.map(({ symbol, amount }) => [symbol, amount])
      );
    
      const arbitrumBalancesObj = Object.fromEntries(
        arbitrumBalances[index].balances.map(({ symbol, amount }) => [symbol, amount])
      );
    
      return [
        {
          address: address,
          chain: "ethereum",
          symbol_values: ethereumBalancesObj,
        },
        {
          address: address,
          chain: "arbitrum",
          symbol_values: arbitrumBalancesObj,
        },
      ];
    });
    
    return JSON.stringify(result, null, '');
  }

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
  
  module.exports = {
    getBalances: getBalances,
    readAddressesFromCSV: readAddressesFromCSV
  };
  