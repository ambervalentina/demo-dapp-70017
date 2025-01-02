require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");

// Load ABI and address from artifacts and environment variables
const Cinnamonroll = require('./artifacts/contracts/Cinnamonroll.sol/Cinnamonroll.json');

const cinnamonrollAddress = process.env.CINA_ADDRESS;

// Set up provider to connect to Sepolia testnet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);

// Create a contract instance for Cinnamonroll
const cinnamonroll = new ethers.Contract(cinnamonrollAddress, Cinnamonroll.abi, provider);

// Function to fetch transfer events
async function fetchTransferEvents(fromBlock, toBlock) {
  // Convert block parameters to numbers
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

module.exports = { fetchTransferEvents };
