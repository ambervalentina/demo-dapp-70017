import React, { useState } from "react";
// import { useApi } from "../hooks/useApi";
import { fetchBalance } from "../utils/api";

function QuerySection() {
    const [address, setAddress] = useState("");
    const [balance, setBalance] = useState(null);
    // const { data: balance, loading, error, execute } = useApi(fetchBalance);

    const handleCheckBalance = async () => {
        if (!address) {
            alert("Please enter an address.");
            return;
        }
        try {
            const result = await fetchBalance(address);
            setBalance(result);
        } catch (error) {
            console.error("Error fetching balance:", error);
            alert("Failed to fetch balance.");
        }
    };

    // Multicall Queries
    const [calls, setCalls] = useState([{ target: "", functionName: "", args: [] }]);
    const [multicallResults, setMulticallResults] = useState([]);

    const handleAddCall = () => {
        setCalls([...calls, { target: "", functionName: "", args: [] }]);
    };

    const handleMulticall = async () => {
        try {
            const response = await fetch("/api/multicall", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ calls }),
            });
            const data = await response.json();
            setMulticallResults(data.results);
        } catch (error) {
            console.error("Error performing multicall:", error);
            alert("Failed to execute multicall.");
        }
    };

    // Event Query
    const [fromBlock, setFromBlock] = useState("");
    const [toBlock, setToBlock] = useState("latest");
    const [events, setEvents] = useState([]);
    const handleFetchEvents = async () => {
        try {
            const response = await fetch(`/api/events?fromBlock=${fromBlock}&toBlock=${toBlock}`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
            alert("Failed to fetch events.");
        }
    };

    return (
        <div>
            <h1>Query Section</h1>
            <div className="intro-section">
                <p>This section allows you to interact with smart contracts to query blockchain data:</p>
                <ul>
                    <li><strong>Balance Check:</strong> Enter a wallet address to check its Ether balance.</li>
                    <li><strong>Multicall Queries:</strong> Execute multiple contract calls in a single request to save gas.</li>
                    <li><strong>Event Query:</strong> Fetch historical events from a contract within a specified block range.</li>
                </ul>
            </div>
            {/* Balance Check */}
            <div>
                <h2>Balance Check</h2>
                <input
                    type="text"
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                        width: "320px",
                    }}
                />
                <button onClick={handleCheckBalance} style={{ marginLeft: "1rem", }}>Check Balance</button>
                {balance !== null && <p>Balance: {balance} ETH</p>}
            </div>
            <h2>Multicall Queries</h2>
            {calls.map((call, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Target address"
                        value={call.target}
                        onChange={(e) =>
                            setCalls(calls.map((c, i) => (i === index ? { ...c, target: e.target.value } : c)))
                        }
                        style={{
                            width: "320px",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Function name"
                        value={call.functionName}
                        onChange={(e) =>
                            setCalls(calls.map((c, i) => (i === index ? { ...c, functionName: e.target.value } : c)))
                        }
                        style={{
                            marginLeft: "1rem",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Arguments (separate by comma)"
                        value={call.args.join(",")}
                        onChange={(e) =>
                            setCalls(calls.map((c, i) => (i === index ? { ...c, args: e.target.value.split(",").map((arg) => arg.trim()) } : c)))
                        }
                        style={{
                            marginLeft: "1rem",
                            width: "300px",
                        }}
                    />
                </div>
            ))}
            <button onClick={handleAddCall}>Add Call</button>
            <button onClick={handleMulticall} style={{ marginLeft: "1rem", marginTop: "1rem", }} >Execute Multicall</button>
            {multicallResults.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Target</th>
                            <th>Success</th>
                            <th>Return Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {multicallResults.map((result, index) => (
                            <tr key={index}>
                                <td>{calls[index].target}</td>
                                <td>{result.success ? "Yes" : "No"}</td>
                                <td>{result.returnData || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <h2>Event Query</h2>
            <input
                type="text"
                placeholder="From block"
                value={fromBlock}
                onChange={(e) => setFromBlock(e.target.value)}
            />
            <input
                type="text"
                placeholder="To block"
                value={toBlock}
                onChange={(e) => setToBlock(e.target.value)}
                style={{
                    marginLeft: "1rem",
                    width: "60px",
                }}
            />
            <button onClick={handleFetchEvents} style={{ marginLeft: "1rem", }}>Fetch Events</button>
            {events.length > 0 && (
                <ul>
                    {events.map((event, index) => (
                        <li key={index}>
                            From: {event.from}, To: {event.to}, Value: {event.value}, Block: {event.blockNumber}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuerySection;
