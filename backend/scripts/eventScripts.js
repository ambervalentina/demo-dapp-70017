require("dotenv").config({
  path: "../.env"
});
const {
  ethers
} = require("ethers");

const Cinnamonroll = require('./artifacts/contracts/Cinnamonroll.sol/Cinnamonroll.json');
const cinnamonrollAddress = process.env.CINA_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const cinnamonroll = new ethers.Contract(cinnamonrollAddress, Cinnamonroll.abi, provider);

async function fetchTransferEvents(fromBlock, toBlock) {
  const fromBlockNum = parseInt(fromBlock, 10);
  const toBlockNum = toBlock === "latest" ? "latest" : parseInt(toBlock, 10);

  const events = await cinnamonroll.queryFilter(
    cinnamonroll.filters.Transfer(),
    fromBlockNum,
    toBlockNum
  );

  return events.map(event => ({
    from: event.args.from,
    to: event.args.to,
    value: ethers.formatEther(event.args.value),
    blockNumber: event.blockNumber,
  }));
}

module.exports = {
  fetchTransferEvents
};