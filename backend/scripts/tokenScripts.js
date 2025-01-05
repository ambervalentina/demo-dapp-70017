require("dotenv").config({
  path: "../.env"
});
const {
  ethers
} = require("ethers");

const Cinnamonroll = require('./artifacts/contracts/Cinnamonroll.sol/Cinnamonroll.json');

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);

const cinnamonrollAddress = process.env.CINA_ADDRESS;
const cinnamonroll = new ethers.Contract(cinnamonrollAddress, Cinnamonroll.abi, signer);

async function getBalance(address) {
  const balance = await cinnamonroll.balanceOf(address);
  return ethers.formatEther(balance);
}

async function transferTokens(to, amount) {
  const tx = await cinnamonroll.transfer(to, ethers.parseEther(amount));
  return await tx.wait();
}

async function simulateTransfer(from, to, amount) {
  const txData = cinnamonroll.interface.encodeFunctionData("transfer", [
    to,
    ethers.parseEther(amount),
  ]);

  // simulation
  const payload = {
    network_id: "11155111", // Sepolia
    from,
    to: cinnamonrollAddress,
    input: txData,
    gas: 8000000,
    gas_price: 1,
    value: 0,
  };

  const response = await fetch(process.env.TENDERLY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Key": process.env.TENDER_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  return result;
}


module.exports = {
  getBalance,
  transferTokens,
  simulateTransfer
};