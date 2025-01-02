const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Cinnamonroll and Multicall Contract Tests", function () {
  let cinnamonroll, multicall, owner, addr1, addr2;

  before(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy Cinnamonroll contract
    const Cinnamonroll = await ethers.getContractFactory("Cinnamonroll");
    cinnamonroll = await Cinnamonroll.deploy();
    await cinnamonroll.waitForDeployment();

    // Deploy Multicall contract
    const Multicall = await ethers.getContractFactory("Multicall");
    multicall = await Multicall.deploy();
    await multicall.waitForDeployment();
  });

  it("Should mint initial supply to owner", async function () {
    const balance = await cinnamonroll.balanceOf(await owner.getAddress());
    expect(ethers.formatEther(balance)).to.equal("100.0"); // Assuming initial supply is 100 CINA
  });

  it("Should transfer tokens between accounts", async function () {
    await cinnamonroll.transfer(addr1.address, ethers.parseEther("10"));
    const balance = await cinnamonroll.balanceOf(await addr1.getAddress());
    expect(ethers.formatEther(balance)).to.equal("10.0");
  });

  it("Should prevent transfers to the contract address", async function () {
    const cinaAddress = await cinnamonroll.getAddress();
    await expect(
      cinnamonroll.transfer(cinaAddress, ethers.parseEther("10"))
    ).to.be.revertedWith("ERC20: transfer to the contract address");
  });

  it("Should execute multicall", async function () {
    const cinaAddress = await cinnamonroll.getAddress();
    const calls = [
      {
        target: cinaAddress,
        callData: cinnamonroll.interface.encodeFunctionData("symbol"),
      },
      {
        target: cinaAddress,
        callData: cinnamonroll.interface.encodeFunctionData("decimals"),
      },
    ];
    const results = await multicall.aggregate(calls);
    console.log(results.returnData[0]);
    const symbol = ethers.toUtf8String(results.returnData[0]);
    const decimals = ethers.BigNumber.from(results.returnData[1]).toNumber();

    expect(symbol).to.equal("CINA");
    expect(decimals).to.equal(18);
  });

  it("Should fetch transfer events", async function () {
    const ownerAddress = await owner.getAddress();
    const a1Address = await addr1.getAddress();
    const transferFilter = cinnamonroll.filters.Transfer(ownerAddress, a1Address);
    const events = await cinnamonroll.queryFilter(transferFilter);
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.value).to.equal(ethers.parseEther("10"));
  });

  it("Should recover tokens sent to the contract", async function () {
    const cinaAddress = await cinnamonroll.getAddress();
    await cinnamonroll.transfer(cinaAddress, ethers.parseEther("5"));
    const contractBalanceBefore = await cinnamonroll.balanceOf(cinaAddress);

    await cinnamonroll.recoverTokens(cinaAddress, ethers.parseEther("5"));
    const contractBalanceAfter = await cinnamonroll.balanceOf(cinaAddress);

    expect(contractBalanceBefore).to.equal(ethers.parseEther("5"));
    expect(contractBalanceAfter).to.equal(0);
  });
});
