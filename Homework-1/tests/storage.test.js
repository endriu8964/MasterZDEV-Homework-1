const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlackToken", function() {
    let token;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function() {
        [owner, addr1, addr2] = await ethers.getSigners();

        const BlackToken = await ethers.getContractFactory("BlackToken");
        token = await BlackToken.deploy(10000, "BlackToken", 18, "BLK");
        await token.deployed();
    });

    it("should add an address to the blacklist", async function() {
        await token.addToBlackList(addr1.address);
        const isBlacklisted = await token.isBlackListed(addr1.address);
        expect(isBlacklisted).to.equal(true);
    });

    it("should remove an address from the blacklist", async function() {
        await token.addToBlackList(addr1.address);
        await token.RemoveFromBlackList(addr1.address);
        const isBlacklisted = await token.isBlackListed(addr1.address);
        expect(isBlacklisted).to.equal(false);
    });

    it("should not allow transfer from a blacklisted address", async function() {
        await token.transfer(addr1.address,10000)
        await token.addToBlackList(addr1.address);
        
        await expect(
            token.connect(addr1).transfer(addr2.address, 100)
        ).to.be.revertedWith("Cannot transfer to blacklisted address");
    });

    it("should not allow transfer to a blacklisted address", async function() {
        await token.addToBlackList(addr2.address);
        
        await expect(
            token.connect(owner).transfer(addr2.address, 100)
        ).to.be.revertedWith("Cannot transfer to blacklisted address");
    });

    it("should allow transfer if both addresses are not blacklisted", async function() {
        const initialBalance = await token.balanceOf(owner.address);
        
        await token.transfer(addr1.address, 100);
        await token.transfer(addr2.address, 50);
        
        const balance1 = await token.balanceOf(addr1.address);
        const balance2 = await token.balanceOf(addr2.address);
        
        expect(balance1).to.equal(100);
        expect(balance2).to.equal(50);
    });

    it("should not allow transferFrom from a blacklisted address", async function() {
        await token.addToBlackList(addr1.address);
        await token.approve(addr1.address, 100);
        
        await expect(
            token.connect(addr1).transferFrom(owner.address, addr1.address, 100)
        ).to.be.revertedWith("Cannot transfer to blacklisted address");
    });

    it("should not allow transferFrom to a blacklisted address", async function() {
        await token.addToBlackList(addr2.address);
        await token.approve(owner.address, 100);
        
        await expect(
            token.connect(owner).transferFrom(owner.address, addr2.address, 100)
        ).to.be.revertedWith("Cannot transfer to blacklisted address");
    });

    it("should allow transferFrom if both addresses are not blacklisted", async function() {
        await token.approve(addr1.address, 100);
        await token.connect(addr1).transferFrom(owner.address, addr2.address, 100);
        
        const balance = await token.balanceOf(addr2.address);
        expect(balance).to.equal(100);
    });
});
