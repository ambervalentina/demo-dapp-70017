const hre = require("hardhat");

async function main() {
  // Deploy Multicall Contract
  const Multicall = await hre.ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.waitForDeployment();
  console.log("Multicall deployed to:", await multicall.getAddress());

  // Deploy Cinnamonroll Contract
  const Cinnamonroll = await hre.ethers.getContractFactory("Cinnamonroll");
  const cinnamonroll = await Cinnamonroll.deploy();
  await cinnamonroll.waitForDeployment();
  console.log("Cinnamonroll deployed to:",await cinnamonroll.getAddress());
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
