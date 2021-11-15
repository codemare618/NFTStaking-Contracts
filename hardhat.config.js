require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-truffle5");

const {privateKey, maticAppId} = require('./config.local');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: 'mumbai',
  networks: {
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com/v1/${maticAppId}`,
      accounts:[privateKey],
    },
    main: {
      url: `https://rpc-mainnet.maticvigil.com/v1/${maticAppId}`,
      accounts:[privateKey],
    },
  },
};
