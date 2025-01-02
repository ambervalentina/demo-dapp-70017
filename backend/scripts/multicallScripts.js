require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
// const path = require("path");
// const multicallAbi = require("./artifacts/contracts/Multicall.sol/Multicall.json");
const Multicall = require('./artifacts/contracts/Multicall.sol/Multicall.json');

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const multicallAddress = process.env.MUIT_ADDRESS;
const multicall = new ethers.Contract(multicallAddress, Multicall.abi, provider);

async function batchCalls(calls) {
  const formattedCalls = calls.map(call => ({
    target: call.target,
    allowFailure: true,
    callData: call.contract.interface.encodeFunctionData(call.functionName, call.args),
  }));

  const results = await multicall.aggregate3(formattedCalls);
  return results.map((result, idx) => ({
    success: result.success,
    returnData: calls[idx].contract.interface.decodeFunctionResult(
      calls[idx].functionName,
      result.returnData
    ),
  }));
}

module.exports = { batchCalls };
