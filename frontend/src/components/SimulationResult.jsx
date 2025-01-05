import React from "react";

const SimulationResult = ({ log }) => {
    if (!log) return null;

    return (
        <div>
            <h3>Simulation Result</h3>
            <p>
                <strong>Contract Address:</strong> {log.contractAddress}
            </p>
            <p>
                <strong>Event:</strong> {log.eventSignature}
            </p>
            <p>
                <strong>From:</strong> {log.from}
            </p>
            <p>
                <strong>To:</strong> {log.to}
            </p>
            <p>
                <strong>Amount Transferred:</strong> {log.amount} Ether
            </p>
        </div>
    );
};

export default SimulationResult;
