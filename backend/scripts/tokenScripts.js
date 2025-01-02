require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");

const Cinnamonroll = require('./artifacts/contracts/Cinnamonroll.sol/Cinnamonroll.json');

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);

const cinnamonrollAddress = process.env.CINA_ADDRESS;
const cinnamonroll = new ethers.Contract(cinnamonrollAddress, Cinnamonroll.abi, signer);

// Get balance of an address
async function getBalance(address) {
  const balance = await cinnamonroll.balanceOf(address);
  return ethers.formatEther(balance);
}

// Transfer tokens
async function transferTokens(to, amount) {
  const tx = await cinnamonroll.transfer(to, ethers.parseEther(amount));
  return await tx.wait();
}

async function simulateTransfer(to, amount) {
    const result = await cinnamonroll.populateTransaction.transfer(
      to,
      ethers.parseEther(amount)
    );
    return await provider.call(result);
  }

// Recover tokens mistakenly sent to the contract
async function recoverTokens(tokenAddress, amount) {
  const tx = await cinnamonroll.recoverTokens(tokenAddress, ethers.parseEther(amount));
  return await tx.wait();
}


module.exports = { getBalance, transferTokens, simulateTransfer, recoverTokens };
