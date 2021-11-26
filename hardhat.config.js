require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-truffle5");

/**
 * @type {ash: {initialSupply: string, symbol: string, name: string}, pool: {initialAshes: string, rewardsPerDay: string}, main: {privateKey: string, nftAddress: string}, rinkeby: {privateKey: string, nftAddress: string}}|{main?: {privateKey: string, nftAddress: string}, rinkeby?: {privateKey: string, nftAddress: string}, ash?: {initialSupply: string, symbol: string, name: string}, pool?: {initialAshes: string, rewardsPerDay: string}}
 */
const config = require('./config.local');

module.exports = {
  solidity: {
    version: "0.8.0",
    // settings: {
    //   optimizer: {
    //     enabled: true,
    //     runs: 200
    //   }
    // }
  },
  defaultNetwork: 'rinkeby',
  networks: {
    main: {
      url: `https://cloudflare-eth.com`,
      chainId: 1,
      accounts:[config.main.privateKey],
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/a907bf24f792438eaf78532306c08997',
      accounts: [config.rinkeby.privateKey],
      chainId :4,
    },
  },
};
