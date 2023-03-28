require('dotenv').config();

const Web3 = require('web3');
const provider = `https://arb-mainnet.g.alchemy.com/v2/${process.env.ETH_MAINNET_KEY}`;
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);

module.exports = {
    web3
};