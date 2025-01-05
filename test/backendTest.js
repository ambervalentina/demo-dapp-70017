const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

describe("Balance Query for Contract Address", function () {
  it("should return the balance of a contract address", async function () {
    const [owner, mockContract] = await ethers.getSigners();
    const cinnamonroll = await ethers.getContractFactory("Cinnamonroll");
    const token = await cinnamonroll.deploy();
    await token.waitForDeployment();

    // query balance
    const balance = await token.balanceOf(mockContract.address);
    expect(balance).to.equal(0);
  });
});


describe("Multicall and Event Fetching Tests", function () {
  let multicall, cinnamonroll, owner, addr1, addr2;

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // deploy Multicall3
    const Multicall = await ethers.getContractFactory("Multicall3");
    multicall = await Multicall.deploy();
    await multicall.waitForDeployment();

    // deploy Cinnamonroll
    const Cinnamonroll = await ethers.getContractFactory("Cinnamonroll");
    cinnamonroll = await Cinnamonroll.deploy();
    await cinnamonroll.waitForDeployment();

    // mint tokens for test
    const address1 = await addr1.getAddress();
    await cinnamonroll.connect(owner).mint(address1, ethers.parseEther("100"));
  });


  // Multicall Tests
  it("should handle large batches of calls", async function () {
    const multicallAddress = await multicall.getAddress();
    const calls = Array(50).fill({
      target: multicallAddress,
      allowFailure: false,
      callData: multicall.interface.encodeFunctionData("getCurrentBlockTimestamp"),
    });
    // console.log(calls);
    const result = await multicall.aggregate3.staticCall(calls);
    // console.log(result);
    expect(result.length).to.equal(50); // All calls should be processed
  });


  // Event Fetching Tests
  it("should fetch transfer events within a valid block range", async function () {
    const address1 = await addr1.getAddress();
    const address2 = await addr2.getAddress();

    // await cinnamonroll.connect(owner).mint(address1, ethers.parseEther("100"));
    const balance = await cinnamonroll.balanceOf(address1);
    expect(balance).to.equal(ethers.parseEther("100"));

    // token transfer
    await cinnamonroll.connect(addr1).transfer(address2, ethers.parseEther("10"));
    // query above events
    const provider = ethers.provider;
    const fromBlock = await provider.getBlockNumber() - 1;
    const toBlock = "latest";

    const filter = cinnamonroll.filters.Transfer();
    const events = await cinnamonroll.queryFilter(filter, fromBlock, toBlock);

    expect(events.length).to.be.greaterThan(0);
    const event = events[1];
    expect(event.args.from).to.equal(address1);
    expect(event.args.to).to.equal(address2);
    expect(event.args.value).to.equal(ethers.parseEther("10"));
  });


  it("should return an empty array when no events match", async function () {
    // block range with no events
    const provider = ethers.provider;
    const fromBlock = await provider.getBlockNumber() + 1;
    const toBlock = fromBlock + 5;

    const filter = cinnamonroll.filters.Transfer();
    const events = await cinnamonroll.queryFilter(filter, fromBlock, toBlock);

    expect(events.length).to.equal(0);
  });


  it("should handle fetching events with 'latest' block", async function () {
    const address1 = await addr1.getAddress();
    const address2 = await addr2.getAddress();
    await cinnamonroll.connect(addr1).transfer(address2, ethers.parseEther("5"));

    // query events up to the latest block
    const filter = cinnamonroll.filters.Transfer();
    const events = await cinnamonroll.queryFilter(filter, 0, "latest");

    expect(events.length).to.be.greaterThan(0);
    const event = events[events.length - 1];
    expect(event.args.from).to.equal(address1);
    expect(event.args.to).to.equal(address2);
    expect(event.args.value).to.equal(ethers.parseEther("5"));
  });


  it("should simulate a valid token transfer", async function () {
    const address1 = await addr1.getAddress();
    const address2 = await addr2.getAddress();

    // simulate transfer
    const result = await cinnamonroll.transfer.staticCall(
      address2,
      ethers.parseEther("10")
    );
    // const result = await ethers.provider.call({
    //   to: cinnamonroll.address,
    //   data: tx.data,
    // });
    // Decode and validate the simulation result
    console.log("Simulation result:", result);
    expect(result).to.equal(true);
  });

});