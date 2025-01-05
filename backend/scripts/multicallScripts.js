require("dotenv").config({
  path: "../.env"
});
const {
  ethers
} = require("ethers");
const Multicall3 = require('./artifacts/contracts/Multicall.sol/Multicall3.json');
const {
  fetchAbiFromEtherscan,
  getFunctionDetails
} = require("./utils/fetchAbi");

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const multicallAddress = process.env.MUIT_ADDRESS;
const multicall = new ethers.Contract(multicallAddress, Multicall3.abi, provider);

async function batchCalls(calls) {
  try {
    const formattedCalls = await Promise.all(
      calls.map(async (call) => {
        const abi = await fetchAbiFromEtherscan(call.target);
        const funcDetails = getFunctionDetails(abi, call.functionName);
        if (!funcDetails) {
          throw new Error(`Function ${call.functionName} not found for contract ${call.target}`);
        }

        const functionAbi = `function ${call.functionName}(${funcDetails.inputType.join(
          ", "
        )}) ${funcDetails.modifiers} returns (${funcDetails.returnType})`;

        // encode call data 
        const iface = new ethers.Interface([functionAbi]);
        return {
          target: call.target,
          allowFailure: call.allowFailure || false,
          callData: iface.encodeFunctionData(call.functionName, call.args),
          functionAbi,
        };
      })
    );

    const results = await multicall.aggregate3.staticCall(formattedCalls);

    return results.map((result, idx) => ({
      success: result.success,
      returnData: result.success ?
        new ethers.Interface([formattedCalls[idx].functionAbi]).decodeFunctionResult(
          calls[idx].functionName,
          result.returnData
        ) : null,
    }));
  } catch (error) {
    console.error("Batch Calls Failed:", error.message);
    throw error;
  }
}

module.exports = {
  batchCalls
};