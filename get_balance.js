const targetAddress = '0x15a3Fe29F4dfe4385FA37FbbA6E4bF032e679D2f';

// =================Imports================= //
const { web3 } = require('./web3_instance/etherum');
const arb_web3 = require('./web3_instance/arbitrum');

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

// =================Initialize Contracts================= //
const initContracts = (web3Instance, tokenList) => {
  const contracts = {};
  for (const symbol in tokenList) {
    const token = tokenList[symbol];
    contracts[symbol] = new web3Instance.eth.Contract(token.abi, token.address);
  }
  return contracts;
};

const ethereumContracts = initContracts(web3, tokens.ethereum);
const arbitrumContracts = initContracts(arb_web3.web3, tokens.arbitrum);

// =================Get Balance================= //
async function getBalance(contract, symbol) {
  try {
    const balance = await contract.methods.balanceOf(targetAddress).call();
    const decimals = await contract.methods.decimals().call();
    const balanceInUsdt = balance / (10 ** decimals);
    return {
      symbol: symbol,
      balance: Number(balanceInUsdt.toFixed(5))
    };
  } catch (error) {
    console.error('查询余额时出错:', error);
    return null;
  }
}

// =================Check Balances================= //
async function checkBalances(contracts) {
  const balances = {};
  for (const symbol in contracts) {
    const balanceInfo = await getBalance(contracts[symbol], symbol);
    if (balanceInfo) {
      balances[symbol] = balanceInfo.balance;
    }
  }
  return balances;
}

(async () => {
  const ethereumBalances = await checkBalances(ethereumContracts);
  const arbitrumBalances = await checkBalances(arbitrumContracts);

  const result = {
    ethereum: ethereumBalances,
    arbitrum: arbitrumBalances
  };

  const jsonResult = JSON.stringify(result, null, 2);
  console.log('查询结果：\n', jsonResult);
})();
