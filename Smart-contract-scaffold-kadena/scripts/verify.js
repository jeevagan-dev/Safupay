const { run, network } = require("hardhat");

async function main() {
  const contractAddress = "0x53f8D31C71046BB39bc2FC0dcD53f0cAc78a1b54";
  const initialSupply =  "1000000";

  if (!contractAddress) {
    console.error("Error: Please set CONTRACT_ADDRESS environment variable.");
    process.exit(1);
  }

  try {
   

    console.log(`Verifying contract at address: ${contractAddress} on network: ${network.name}`);

    // Run the verification task with constructor arguments matching your contract
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [ethers.utils.parseUnits(initialSupply, 18)],
    });

    console.log(`✅ Contract verified successfully on network: ${network.name}`);
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
