const express = require("express");
const router = express.Router();
const { getBalance, transferTokens, simulateTransfer, recoverTokens } = require("../scripts/tokenScripts.js");
const { batchCalls } = require("../scripts/multicallScripts.js");
const { fetchTransferEvents } = require("../scripts/eventScripts.js");

// Get token balance
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

// Multicall
router.post("/multicall", async (req, res) => {
  try {
    const calls = req.body.calls; // Array of call configurations
    const results = await batchCalls(calls);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Multicall failed" });
  }
});

// Transfer tokens: add an recoverTokens into it
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

// events
router.get("/events", async (req, res) => {
  try {
    const { fromBlock, toBlock } = req.query; // Pass block numbers as query params
    const events = await fetchTransferEvents(fromBlock, toBlock);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Simulate Transactions
router.post("/simulate", async (req, res) => {
  try {
    const { to, amount } = req.body;
    const result = await simulateTransfer(to, amount);
    res.json({ simulation: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
});


module.exports = router;
