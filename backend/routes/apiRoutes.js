const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();
const { getBalance, transferTokens, simulateTransfer } = require("../scripts/tokenScripts.js");
const { batchCalls } = require("../scripts/multicallScripts.js");
const { fetchTransferEvents } = require("../scripts/eventScripts.js");

router.get("/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await getBalance(address);
    res.json({ balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

router.post("/multicall", async (req, res) => {
  try {
    const calls = req.body.calls;

    if (!Array.isArray(calls) || calls.length === 0) {
      return res.status(400).json({ error: "Invalid or empty calls array" });
    }
    const results = await batchCalls(calls);

    const formattedResults = results.map((result) => ({
      success: result.success,
      returnData: result.returnData
        ? ethers.formatEther(result.returnData[0])
        : null,
    }));

    res.json({ results: formattedResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Multicall failed" });
  }
});

router.post("/transfer", async (req, res) => {
  try {
    const { to, amount } = req.body;
    const receipt = await transferTokens(to, amount);
    res.json({ receipt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to transfer tokens" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const { fromBlock, toBlock } = req.query;
    const events = await fetchTransferEvents(fromBlock, toBlock);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/simulate", async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing required parameters: from, to, or amount" });
    }

    const result = await simulateTransfer(from, to, amount);
    const logs = result.transaction.transaction_info.logs.map((log) => ({
      address: log.raw.address,
      topics: log.raw.topics,
      data: log.raw.data,
    }));
    res.json({ logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});


module.exports = router;
