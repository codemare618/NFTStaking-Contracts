const hre = require('hardhat');
const Config = require('../config.local');

async function main() {
  const {ethers, network:{name: networkName}} = hre;

  console.log(`Deploying to ${networkName} Network`);

  const network = await hre.ethers.provider.getNetwork();
  const {chainId} = network;

  let nftTokenAddress;
  if (chainId === 1) { // ETHEREUM MAINNET
    nftTokenAddress = Config.main.nftAddress;
  } else if (chainId === 4) {
    nftTokenAddress = Config.rinkeby.nftAddress;
  } else {
    console.log('Unsupported network');
    process.exit(1);
  }

  // We get the contract to deploy
  const ASHToken = await ethers.getContractFactory('ASHToken');
  const token = await ASHToken.deploy(
      Config.ash.name,
      Config.ash.symbol,
      hre.ethers.utils.parseEther(Config.ash.initialSupply)
  );
  await token.deployed();



  const POOL = await ethers.getContractFactory('NFTStakingPool');
  const pool = await POOL.deploy(
      nftTokenAddress,
      token.address,
      ethers.utils.parseEther(Config.pool.rewardsPerDay)
  );
  await pool.deployed();

  console.log('Minting tokens to pool');
  const tx = await token.mint(pool.address, ethers.utils.parseEther(Config.pool.initialAshes));

  console.log('-------------------Deployment Information------------------');
  console.log(`ASHToken Deployed : ${token.address}`)
  console.log(`NFTStakingPool Deployed : ${pool.address}`);
  console.log('-----------------------------------------------------------');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
