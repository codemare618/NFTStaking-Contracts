const {expect} = require('chai');
const {BN, expectRevert, ether} = require('@openzeppelin/test-helpers');
const StakingPool = artifacts.require('NFTStakingPool');
const TestNFT = artifacts.require('TestNFT');
const ASHToken = artifacts.require('ASHToken');


const sleep = (time) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

contract('NFTStakingPool', function([owner, addr1, addr2, addr3, addr4, ...addrs]) {
    let token;
    let nft;
    let stakingPool;
    beforeEach(async function(){
        token = await ASHToken.new(
            'ASHToken',
            'ASH',
            ether('2000000000'));
        nft = await TestNFT.new(
            'TestNFT',
            'TNT'
        );
        stakingPool = await StakingPool.new(
            nft.address,
            token.address,
            10
        );

        await token.mint(stakingPool.address, ether('1000000000000'));
    });
    it('Should check if deposit works', async function(){
        await nft.mintNFT(addr1);
        await nft.mintNFT(addr1);
        await nft.mintNFT(addr1);
        await nft.mintNFT(addr1);
        await nft.mintNFT(addr2);
        await nft.mintNFT(addr3);
        await nft.mintNFT(addr4);

        await expectRevert(nft.safeTransferFrom(addr2, stakingPool.address, 3, {from: addr2}), 'ERC721: transfer caller is not owner nor approved')
        await nft.safeTransferFrom(addr1, stakingPool.address, 2, {from: addr1});
        expect((await nft.ownerOf(2)).toLowerCase()).to.equal(stakingPool.address.toLowerCase(), "Should be deposited")

        await nft.safeTransferFrom(addr1, stakingPool.address, 1, {from: addr1});
        expect((await stakingPool.numberOfTokensStakedFor(addr1)).toNumber()).to.equal(2, '2 NFT should be deposited')
        await nft.safeTransferFrom(addr1, stakingPool.address, 0, {from: addr1});
        expect((await stakingPool.numberOfTokensStakedFor(addr1)).toNumber()).to.equal(3, '3 NFT should be deposited')
        await expectRevert(nft.safeTransferFrom(addr2, stakingPool.address, 4), 'ERC721: transfer caller is not owner nor approved')
        await nft.safeTransferFrom(addr2, stakingPool.address, 4, {from: addr2});
        expect((await stakingPool.numberOfTokensStaked()).toNumber()).to.equal(4, 'Totally 4 NFT should be deposited')
        const expectedTokenIds = [2,1,0,4];
        // await
        let totalMintedNFTs = (await stakingPool.numberOfTokensStaked()).toNumber();
        for (let i = 0; i < totalMintedNFTs; i++){
            const result = await stakingPool.tokenIdAtIndex(i);
            const tokenId = result[0];
            expect(expectedTokenIds[i]).to.equal(tokenId.toNumber(), `${i}-th staked token should be ${expectedTokenIds[i]}`)
        }

        await expectRevert(stakingPool.stakeInfoForToken(3), 'Not staked token')
        const stakeInfoToken0 = await stakingPool.stakeInfoForToken(0);
        expect(stakeInfoToken0[1].toNumber()).to.be.above(0, 'First token depositTime should be larger than zero')
        expect(stakeInfoToken0[2].toNumber()).to.equal(0, 'First token withdrawals should be zero')
        const stakeInfoToken1 = await stakingPool.stakeInfoForToken(0);
        expect(stakeInfoToken1[1].toNumber()).to.be.above(0, 'Second token depositTime should be larger than zero')
        expect(stakeInfoToken1[2].toNumber()).to.equal(0, 'Second token withdrawals should be zero')
        const stakeInfoToken2 = await stakingPool.stakeInfoForToken(0);
        expect(stakeInfoToken2[1].toNumber()).to.be.above(0, 'Third token depositTime should be larger than zero')
        expect(stakeInfoToken2[2].toNumber()).to.equal(0, 'Third token withdrawals should be zero')
        const stakeInfoToken3 = await stakingPool.stakeInfoForToken(0);
        expect(stakeInfoToken3[1].toNumber()).to.be.above(0, 'Fourth token depositTime should be larger than zero')
        expect(stakeInfoToken3[2].toNumber()).to.equal(0, 'Fourth token withdrawals should be zero')
        expect((await stakingPool.stakerOfToken(2)).toLowerCase()).to.be.equal(addr1.toLowerCase(), addr1 + ' should own token2')

        await expectRevert(stakingPool.withdrawNFT(3, {from: addr1}), 'The token is not staked');
        await expectRevert(stakingPool.withdrawNFT(4, {from: addr1}), 'Not the token owner');
        await expectRevert(stakingPool.withdrawNFT(2), 'Not the token owner');
        expect((await nft.balanceOf(addr1)).toNumber()).to.equal(1, 'Balance of addr1 should be 1')
        expect((await stakingPool.numberOfTokensStakedFor(addr1)).toNumber()).to.equal(3, 'Balance of addr1 should be 1')
        await sleep(6000);
        console.log('Slept 6 seconds.....')
        await stakingPool.withdrawReward(0, {from: addr1});
        console.log('-------->', await stakingPool.stakeInfoForToken(0));
        await sleep(6000);
        console.log('Slept 6 seconds.....')
        await stakingPool.withdrawReward(0, {from: addr1});
        console.log('-------->', await stakingPool.stakeInfoForToken(0));
        await stakingPool.withdrawNFT(0, {from: addr1})
        expect((await nft.balanceOf(addr1)).toNumber()).to.equal(2, 'Balance of addr1 should be 2')
        expect((await stakingPool.numberOfTokensStakedFor(addr1)).toNumber()).to.equal(2, 'Balance of addr1 should be 2')

    })
    it('Should check if deposit works', async function(){


    })
});