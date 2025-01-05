import React from "react";
import { ethers } from "ethers";

const TransactionReceipt = ({ receipt }) => {
    if (!receipt) return null;

    const decodedLogs = receipt.logs.map((log, index) => ({
        event: "Transfer (ERC20)", 
        contract: log.address,
        from: `0x${log.topics[1].slice(26)}`,
        to: `0x${log.topics[2].slice(26)}`, 
        amount: ethers.formatEther(log.data),
    }));

    return (
        <div>
            <h3>Transaction Receipt</h3>
            <p>
                <strong>Transaction Hash:</strong> {receipt.hash}
            </p>
            <p>
                <strong>Block Number:</strong> {receipt.blockNumber}
            </p>
            <p>
                <strong>From:</strong> {receipt.from}
            </p>
            <p>
                <strong>To:</strong> {receipt.to || "Contract Deployment"}
            </p>
            <p>
                <strong>Gas Used:</strong> {receipt.gasUsed}
            </p>
            <p>
                <strong>Status:</strong> {receipt.status === 1 ? "Success" : "Failed"}
            </p>
            {decodedLogs.length > 0 && (
                <div>
                    <h3>Logs:</h3>
                    {decodedLogs.map((log, index) => (
                        <div key={index} style={{ marginBottom: "1rem" }}>
                            <p><strong>Event:</strong> {log.event}</p>
                            <p><strong>Contract:</strong> {log.contract}</p>
                            <p><strong>From:</strong> {log.from}</p>
                            <p><strong>To:</strong> {log.to}</p>
                            <p><strong>Amount:</strong> {log.amount} Ether</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionReceipt;
