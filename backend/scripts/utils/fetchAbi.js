require("dotenv").config({path: "../../.env"});

const fetchAbiFromEtherscan = async (contractAddress) => {
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
  const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "1") {
    return JSON.parse(data.result);
  } else {
    throw new Error("ABI not found");
  }
};

const getFunctionDetails = (abi, functionName) => {
  const func = abi.find(
    (item) => item.type === "function" && item.name === functionName
  );

  if (!func) {
    console.error(`Function "${functionName}" not found in the ABI.`);
    return null;
  }

  const inputType = func.inputs.map((input) => `${input.type || ''}`);
  const args = func.inputs.map((input) => `${input.name || ''}`);
  const modifiers = func.stateMutability;
  const returnType = func.outputs.map((output) => output.type).join(", ");

  return {
    inputType,
    args,
    modifiers,
    returnType
  };
};


module.exports = {
  fetchAbiFromEtherscan,
  getFunctionDetails
};