const NFT = artifacts.require('TestNFT');

contract('TestNFT', function([owner, addr1, addr2, addr3, ...addrs]) {
    let nft;
    console.log('NFT --- ', owner)
    beforeEach(async function(){
        nft = await NFT.new(
            'TestNFT',
            'TNT'
        );
    });
});
