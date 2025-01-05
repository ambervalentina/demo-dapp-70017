import React, { useState } from "react";
import SimulationResult from "./SimulationResult";
import TransactionReceipt from "./TransactionReceipt";
import { simulateTransfer, performTransfer, decodeSimulationResult, formatTransactionReceipt } from "../utils/api";

function TransferSection() {
    const [sender, setSender] = useState("");
    const [simulationRecipient, setSimulationRecipient] = useState("");
    const [simulationAmount, setSimulationAmount] = useState("");
    const [directRecipient, setDirectRecipient] = useState("");
    const [directAmount, setDirectAmount] = useState("");
    const [simulationResult, setSimulationResult] = useState(null);
    const [transferReceipt, setTransferReceipt] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const etherscanBaseUrl = "https://sepolia.etherscan.io/tx/"

    const handleSimulate = async () => {
        if (!sender || !simulationRecipient || !simulationAmount) {
            alert("Please fill in all fields for simulation.");
            return;
        }
        try {
            const result = await simulateTransfer(sender, simulationRecipient, simulationAmount);
            const simulatedLog = {
                address: result.logs[0].address,
                topics: result.logs[0].topics,
                data: result.logs[0].data,
            };
            const decodedResult = decodeSimulationResult(simulatedLog);
            setSimulationResult(decodedResult);
            alert("Simulation successful! Check the result below.");
        } catch (error) {
            console.error("Error simulating transaction:", error);
            alert("Simulation failed.");
        }
    };

    const handleDirectTransfer = async () => {
        setLoading(true);
        if (!directRecipient || !directAmount) {
            alert("Please fill in all fields for direct transfer.");
            return;
        }
        try {
            const result = await performTransfer(directRecipient, directAmount);
            const formattedReceipt = formatTransactionReceipt(result);
            setTransferReceipt(formattedReceipt);
            setShowModal(true);
        } catch (error) {
            console.error("Error performing transfer:", error);
            alert("Transfer failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulatedTransfer = async () => {
        setLoading(true);
        if (!simulationRecipient || !simulationAmount) {
            alert("Please fill in all fields for transfer after simulation.");
            return;
        }
        try {
            const result = await performTransfer(simulationRecipient, simulationAmount);
            const formattedReceipt = formatTransactionReceipt(result);
            setTransferReceipt(formattedReceipt);
            setShowModal(true);
        } catch (error) {
            console.error("Error performing simulated transfer:", error);
            alert("Transfer failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Transfer Section</h1>
            <div className="intro-section">
                This section allows you to simulate and perform Ether transactions. You can either:
                <ul>
                    <li>Simulate a transfer to check the transaction details before executing (forked chain provided by Tenderly).</li>
                    <li>Directly perform a transfer by providing the recipient address and amount.</li>
                    <li>Check your transfer details with a link to Etherscan.</li>
                </ul>
            </div>

            {/* Simulation Section */}
            <h2>Simulate Transaction</h2>
            <input
                type="text"
                placeholder="Sender address"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                style={{
                    width: "300px",
                }}
            />
            <input
                type="text"
                placeholder="Recipient address"
                value={simulationRecipient}
                onChange={(e) => setSimulationRecipient(e.target.value)}
                style={{
                    marginLeft: "1rem",
                    width: "300px",
                }}
            />
            <input
                type="text"
                placeholder="Amount (in Ether)"
                value={simulationAmount}
                onChange={(e) => setSimulationAmount(e.target.value)}
                style={{
                    marginLeft: "1rem",
                }}
            />
            <button onClick={handleSimulate} style={{ marginLeft: "1rem", }}>Simulate</button>
            {simulationResult && (
                <div>
                    <SimulationResult log={simulationResult} />
                    <button onClick={handleSimulatedTransfer} disabled={loading}>
                        {loading ? "Processing..." : "Perform Transfer"}
                    </button>
                </div>
            )}

            {/* Direct Transfer Section */}
            <h2>Perform Direct Transfer</h2>
            <input
                type="text"
                placeholder="Recipient address"
                value={directRecipient}
                onChange={(e) => setDirectRecipient(e.target.value)}
                style={{
                    marginRight: "1rem",
                    width: "300px",
                }}
            />
            <input
                type="text"
                placeholder="Amount (in Ether)"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
            />
            <button onClick={handleDirectTransfer} disabled={loading} style={{ marginLeft: "1rem", }}>
                {loading ? "Processing..." : "Direct Transfer"}
            </button>

            {/* Loading Indicator */}
            {loading && (
                <div style={loadingStyle}>
                    <p>Processing transaction... Please wait.</p>
                </div>
            )}

            {/* Modal for Full Receipt */}
            {showModal && transferReceipt && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <TransactionReceipt receipt={transferReceipt} />
                        <button onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
            {/* Summary of Transfer */}
            {transferReceipt && (
                <div style={{ marginTop: "1rem" }}>
                    <h2>Transfer Summary</h2>
                    <p>
                        <strong>Transaction Hash:</strong>{" "}
                        <a
                            href={`${etherscanBaseUrl}${transferReceipt.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {transferReceipt.hash}
                        </a>
                    </p>
                    <p>
                        <strong>Block Number:</strong> {transferReceipt.blockNumber}
                    </p>
                    <p>
                        <strong>Gas Used:</strong> {transferReceipt.gasUsed}
                    </p>
                </div>
            )}
        </div>
    );
}

const loadingStyle = {
    marginTop: "1rem",
    padding: "1rem",
    textAlign: "center",
    fontStyle: "italic",
    color: "#555",
};

const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center", 
    zIndex: 1000, 
};

const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px", 
    maxWidth: "800px",
    width: "90%", 
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
    textAlign: "center",
};


export default TransferSection;
