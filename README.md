# Demo DApps: ERC20 token, Querying and Multicall
This is the lecture notes for [COMP70017 Principles of Distributed Ledgers](https://www.imperial.ac.uk/computing/current-students/courses/70017/)
 guest lecture in the form of demo DApp. The project consist of 3 parts: two smart contracts, a simple backend and a Vite+React frontend. Currently the app could only be deployed to localhost (default port 5173) as a demo. 
## Smart contracts:
<div style="display: flex; align-items: center; justify-content: space-between;">
  <div>
    <code>Cinnamonroll.sol</code>: My own ERC20 token Cinnamonroll (CINA) deployed 
    <a href="https://sepolia.etherscan.io/token/0x9904934201ae05e44d0aedc339b408ec80172b9b">here</a> 
    on Sepolia testing network, implementing ERC-20 token standard by inheriting properties from OpenZeppelin ERC20 contract.
  </br><code>multicall.sol</code>: Multicall3 contract for batching multiple on chain calls and handling concurrent requests, as provided in the lecture.
  </div>
  <div>
    <img src="https://github.com/ambervalentina/demo-dapp-70017/blob/main/cinna.png" alt="Cinnamonroll Icon" width="100"><br>
    <span style="font-size: smaller;">$ CINA</span>
  </div>
</div>

| **Tool/Library**      | **Purpose**                                        | **Description**                                       |
|------------------------|-----------------------------------------------------|-----------------------------------------------------------------|
| **Solidity**           | Programming smart contracts                        | Language for Ethereum smart contracts |
| **Hardhat**            | Contract development, testing, and deployment      | Plugins for deployment and backend/frontend interaction testing.   |
| **Foundry**            | Lightweight testing framework for smart contracts  | Fast and low-overhead unit testing of core functionalities in Solidity |
| **Sepolia Testnet**    | Blockchain network for testing                     | Ethereum test network for deploying and testing smart contracts. |
| **OpenZeppelin**       | Reusable contract libraries (e.g., ERC-20)         | Provide ERC20 standard |
| **Chai/Mocha**         | JavaScript testing frameworks                      | Write assertions and run tests in the Hardhat environment. |

### testing with `hardhat` and `foundry`
Contracts are deployed and integrated into backend in this project, so it's important to test them before deployment. Here two testing framework are used to handle different needs:
- `tokenTest.t.sol` and `multiTest.t.sol`: Solidity-based tests using Foundry. Foundry tests are lightweighted and fast, more suitable for testing basic contract functionalities and validation under various inputs.
- `backendTest.js`: Javascript-based tests using Hardhat and Chai. Hardhat tests are more compatible with backend and frontend. Here the hardhat test is designed to simulate and valid realistic contract interactions in backend. This is especially important as the project requires Alchemy and Tenderly APIs which both have limited usages.
</br> The hybrid testing ensures both core contract logic and end-to-end workflows are thoroughly tested and could pass to deployment for backend.

### contract deployment and verification
Both of the contracts are deployed to Sepolia (a testing network for Ethereum) using hardhat. `Cinnamonroll.sol` is later verified for querying purpose. Deployment using hardhat requires a sepolia url (you can create one from Alchemy Dashboard) and your private key, both of `SEPOLIA_URL` and `PRIVATE_KEY` should be stored in an `.env` at root level of the app. A successful deployment will print two contracts' addresses. They should also be stored in `.env` at `CINA_ADDRESS` and `MUIT_ADDRESS` for backend applications. Contract ABIs are automatically stored to backend folder by a reconfiguration in `hardhat.config.js`.


## Backend
The backend provides APIs to interact with the Cinnamonroll ERC-20 token contract and the Multicall3 contract. It enables functionalities such as checking balances, transferring tokens, simulating transactions, querying events, and executing multicalls. 

| **Tool/Library**       | **Purpose**                                | **Description**                                     |
|-------------------------|--------------------------------------------|-----------------------------------------------------|
| **Node.js**            | Backend runtime                           | JavaScript runtime environment for building backend applications. |
| **Express.js**         | Web server framework                      | Minimal and flexible web application framework for Node.js. |
| **Ethers.js**          | Ethereum blockchain interaction library   | Library for interacting with the Ethereum blockchain and smart contracts. |
| **Tenderly API**       | Transaction simulation                    | API for simulating and debugging Ethereum transactions. |


### API endpoints
There are five endpoints:
- `GET /api/balance/:address`: Fetch token balance.
- `POST /api/multicall`: Perform batch on-chain calls.
- `POST /api/transfer`: Transfer tokens.
- `GET /api/events`: Fetch transfer events.
- `POST /api/simulate`: Simulate transactions using Tenderly (requires API key and url from tenderly, `TENDER_API_KEY` and `TENDERLY_API_URL` need to be stored in `.env`).

</br> `apiRoutes.js` collects all these endpoints from `scripts/tokenScripts.js`, `scripts/multicallScripts.js` and `scripts/eventScripts.js` and is called by `index.js` for server. 
</br> To improve user experience in frontend, `scripts/utils/fetchAbi.js` will automatically generate function ABI for multicall query by inputing contract address and function name. This requires an Etherscan API where you can get [here](https://etherscan.io/myapikey) after creating an Etherscan account. Store the `ETHERSCAN_API_KEY` in `.env` before running the server.

### CURL testing example
#### Check Token Balance
```
curl -X GET "http://localhost:5001/api/balance/0xYourAddress"
```
output:
```
{"balance":"100.0"}
```
#### Transfer Tokens
```
curl -X POST "http://localhost:5001/api/transfer" \
     -H "Content-Type: application/json" \
     -d '{"to": "0xRecipientAddress", "amount": "10"}'
```
output:
```
{"receipt":
     {"_type":
          // ....
     }
}
```
*notice that currently the token is unable to reach the target's address, instead it goes into the deployed contract. This function will be improve in the next version of the dApp.
#### Multicall
```
curl -X POST "http://localhost:5001/api/multicall" \
-H "Content-Type: application/json" \
-d '{
  "calls": [
    {
      "target": "0x9904934201AE05E44d0AEdC339b408EC80172b9b",
      "functionName": "balanceOf",
      "args": ["0x2E0Dc6117Da0B6C79c4d955b9fBe04FBA47acf71"]
    },
    {
      "target": "0x9904934201AE05E44d0AEdC339b408EC80172b9b",
      "functionName": "totalSupply",
      "args": []
    }
  ]
}'

```
output:
```
{"results":[{"success":true,"returnData":"100.0"},{"success":true,"returnData":"100.0"}]}
```
#### Simulate transfer
```
curl -X POST "http://localhost:5001/api/simulate" \
-H "Content-Type: application/json" \
-d '{
  "from": "0x2E0Dc6117Da0B6C79c4d955b9fBe04FBA47acf71",
  "to": "0x2E0Dc6117Da0B6C79c4d955b9fBe04FBA47acf71",
  "amount": "10"
}'
```
output:
```
{"logs":[{"address":"0x9904934201ae05e44d0aedc339b408ec80172b9b","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000002e0dc6117da0b6c79c4d955b9fbe04fba47acf71","0x0000000000000000000000002e0dc6117da0b6c79c4d955b9fbe04fba47acf71"],"data":"0x0000000000000000000000000000000000000000000000008ac7230489e80000"}]}
```
#### fetch event
```
curl -X GET "http://localhost:5001/api/events?fromBlock=1&toBlock=100" \
-H "Content-Type: application/json"

```
output:
```
curl -X GET "http://localhost:5001/api/events?fromBlock=1&toBlock=100" \
-H "Content-Type: application/json"

```

## Frontend:
This project is the frontend interface for interacting with smart contracts on the Ethereum blockchain. The interface is divided into two pages: query and transfer. The application is built using Vite, React, and Ethers.js for efficient performance and better user experience.

| **Tool/Library**       | **Purpose**                                | **Description**                                     |
|-------------------------|--------------------------------------------|-----------------------------------------------------|
| **React**              | User interface                            | Library for building interactive user interfaces.   |
| **Vite**               | Development environment                   | Fast and modern development environment and build tool for web applications. |
| **Ethers.js**          | Blockchain interactions                   | Library for interacting with the Ethereum blockchain and smart contracts. |
| **CSS Modules**        | Styling and component design              | Scoped and modular CSS for styling React components. |
| **API Proxy**          | Backend connection                        | Middleware to connect the front-end to the backend for blockchain operations. |

### Usage
#### Query Section
1. Navigate to the Query Section tab.
2. Use the following features:
    - Balance Check: Enter a wallet address and click "Check Balance."
    - Multicall Queries: Add contract calls with target address, function name, and arguments.
    - Event Query: Provide a block range to fetch contract events.
#### Transfer Section
1. Navigate to the Transfer Section tab.
2. Simulate or directly perform Ether transfers:
    - Simulate Transaction: Enter sender and recipient addresses and an amount to simulate the transfer.
    - Perform Transfer: Directly send Ether and view the transaction receipt and summary.

## Workflow
- open your own project folder eg `COMP70017`
- `foundryup` (if you want to run foundry tests)
- check the `remappings.txt`:
  ```
  forge-std/=lib/forge-std/src/
  ds-test/=lib/ds-test/src/
  ```
- clone this repository

| **contract** | **backend** | **frontend** |
|--------------|-------------|--------------|
| `cd demo-dapp-70017`| `cd demo-dapp-70017/backend` | `cd demo-dapp-70017/frontend` |
| `npm install`| `npm install`| `npm install`| 
| `touch .env` | `node index.js` | `npm run dev` |
| `npx hardhat compile`| keep running | paste http://localhost:5173/ into browser |
| `npx hardhat run scripts/deploy.js --network sepolia` | open another terminal | |
| record contract address | | |
| `npx hardhat verify --network sepolia ERC20_CONTRACT_ADDRESS` | | |

