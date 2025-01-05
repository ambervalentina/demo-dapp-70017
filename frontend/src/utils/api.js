import {ethers} from "ethers";

export const decodeSimulationResult = (log) => {
  return {
    contractAddress: log.address,
    eventSignature: "Transfer (ERC20)",
    from: `0x${log.topics[1].slice(26)}`,
    to: `0x${log.topics[2].slice(26)}`,
    amount: ethers.formatEther(log.data),
  };
};

export const fetchBalance = async (address) => {
  const response = await fetch(`/api/balance/${address}`);
  if (!response.ok) throw new Error("Failed to fetch balance.");
  const data = await response.json();
  return data.balance;
};

export const fetchMulticall = async (calls) => {
  const response = await fetch("/api/multicall", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      calls
    }),
  });
  if (!response.ok) throw new Error("Multicall failed.");
  return await response.json();
};

export const fetchEvents = async (fromBlock, toBlock) => {
  const response = await fetch(`/api/events?fromBlock=${fromBlock}&toBlock=${toBlock}`);
  if (!response.ok) throw new Error("Failed to fetch events.");
  return await response.json();
};

export const simulateTransfer = async (from, to, amount) => {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      amount
    }),
  });
  if (!response.ok) throw new Error("Simulation failed.");
  return await response.json();
};

export const performTransfer = async (to, amount) => {
  const response = await fetch("/api/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to,
      amount
    }),
  });
  if (!response.ok) throw new Error("Transfer failed.");
  return await response.json();
};

export const formatTransactionReceipt = (result) => {
  const receipt = result.receipt;
  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
    to: receipt.to || null,
    gasUsed: receipt.gasUsed,
    status: receipt.status,
    logs: receipt.logs.map((log) => ({
      address: log.address,
      topics: log.topics,
      data: log.data,
      transactionHash: log.transactionHash,
      transactionIndex: log.transactionIndex,
      blockHash: log.blockHash,
      blockNumber: log.blockNumber,
    })),
  };
};