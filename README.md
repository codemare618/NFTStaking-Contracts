# InVidMe Token

## Requirements

- Node.js  v10.0 or higher


## Install dependencies

```shell
$npm install
```


## Testing

- Run shared hardhat node

```shell
$npx hardhat node
```

- Test ERC20Token

```shell
$npm run test-token
```

- Test NFT

```shell
$npm run test-nft
```


## Deployment Configuration

- Copy `config.local.js.sample` and name it `config.local.js`


- `config.local.js`

There are two types of network at Polygon. (`Mumbai` and `MainNet`)

`Mumbai` is the test net environment which matches `Goerli` test net on ethereum.
`MainNet` is the real environment which matches ethereum network.


Update private key for the account as pointed out in the followings.

To get `maticAppId`, in the configuration, visit [rpc.maticvigil.com](https://rpc.maticvigil.com), add your own app and get your own, or you can use current api for deploying

Also there are various ways to get the urls for MATIC network. (e.g. [Alchemy](https://www.alchemy.com/))

```javascript
module.exports = {
    privateKey: '',
    maticAppId:'477c48c7ba7a9b85842f9bbae5d26be8c9dc754b',    // 
    coder: {
        initialSupply: '2000000000',  // 20 billion
        name: 'InvidMeToken',
        symbol: 'CODER',
    },
    nft: {
        name: 'InVidMeNFT',
        symbol: 'VID',
    },
    // Do not touch following values
    mumbai: {
        childChainManager: '0xb5505a6d998549090530911180f38aC5130101c6'
    },
    main: {
        childChainManager: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
    }
};
```

Double check if childChainManagers are correctly configured for PoS bridging for future

Property path for ChildChainManager is `Matic->POSContracts->ChildChainManagerProxy`

Visit  [Contract Addresses on Mumbai](https://static.matic.network/network/testnet/mumbai/index.json)

Visit [Contract Addresses on Polygon Mainnet](https://static.matic.network/network/mainnet/v1/index.json)



## Deploying

- Deploying to mumbai testnet

```shell
$npm run deploy-mumbai
```


- Deploying to main net

```shell
$npm run deploy-main
```
