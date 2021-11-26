const {expect} = require('chai');
const {BN, expectRevert, ether} = require('@openzeppelin/test-helpers');

const Token = artifacts.require('ASHToken');

contract('ASHToken', function([owner, addr1, addr2, addr3, ...addrs]) {
    beforeEach(async function(){
        this.token = await Token.new(
            'ASHToken',
            'ASH',
            ether('2000000000'));
    });

    it('Should check if everything works', async function(){
        await this.token.transfer(addr1, ether('200'));
        expect(await this.token.balanceOf(addr1)).to.be.bignumber.equal(ether('200'), "Deposited Ether should be 200");

        // // Try to burn
        // await expectRevert(this.token.withdraw(ether('100'), {from: addr1}), "Burning not allowed");
        //
        // mint with wrong permission
        await expectRevert(this.token.mint(addr2, ether('100'), {from: addr1}), "Ownable: caller is not the owner");

        // mint with correct permission
        // await this.token.mint(addr1, ether('100'));
        // expect(await this.token.balanceOf())


        // before Token Transfer
        // await this.token._beforeTokenTransfer(owner, addr1, ether('200'))
        //
        // // Set burn allowed
        // await this.token.setBurnAllowed({from: owner});
        //
        // // Try withdraw
        // await this.token.withdraw(ether('100'), {from: addr1});
        //
        // expect(await this.token.balanceOf(addr1)).to.be.bignumber.equal(ether('100'), "Remaining Ether should be 100");
    })
});

