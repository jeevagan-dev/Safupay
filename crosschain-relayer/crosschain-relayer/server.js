require("dotenv").config();
const { ethers } = require("ethers");


const providerA = new ethers.JsonRpcProvider(process.env.CHAIN_0_RPC);
const providerB = new ethers.JsonRpcProvider(process.env.CHAIN_1_RPC);


const relayerWalletA = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, providerA);
const relayerWalletB = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, providerB);


const bridgeAAddress = process.env.BRIDGE_0_ADDRESS;
const bridgeBAddress = process.env.BRIDGE_1_ADDRESS;


const bridgeABI = [
  "event Locked(address sender, uint256 amount, string targetChain, address recipient)",
  "event Burned(address sender, uint256 amount, string targetChain, address recipient)",
  "function mintTokens(address recipient, uint256 amount) external",
  "function unlockTokens(address recipient, uint256 amount) external"
];


const bridgeA = new ethers.Contract(bridgeAAddress, bridgeABI, relayerWalletA);
const bridgeB = new ethers.Contract(bridgeBAddress, bridgeABI, relayerWalletB);

async function main() {
    try {
      
        const blockA = await providerA.getBlockNumber();
        const blockB = await providerB.getBlockNumber();
        console.log(`✅ Connected to Chain A (Block ${blockA})`);
        console.log(`✅ Connected to Chain B (Block ${blockB})`);
        console.log(`Relayer wallet: ${relayerWalletA.address}`);
        console.log("Listening for cross-chain events...\n");

    } catch (err) {
        console.error("❌ Error connecting to chains:", err);
        process.exit(1);
    }

  
    bridgeA.on("Locked", async (sender, amount, targetChain, recipient) => {
        if(targetChain === "ChainB"){
            console.log(`\n🔗 [A->B] Locked ${ethers.formatUnits(amount, 18)} tokens from ${sender} for ${recipient}`);
            try {
                const tx = await bridgeB.mintTokens(recipient, amount);
                await tx.wait();
                console.log(`✅ [A->B] Minted ${ethers.formatUnits(amount, 18)} tokens to ${recipient} on Chain B`);
            } catch (err) {
                console.error("❌ Error minting on Chain B:", err);
            }
        }
    });

   
    bridgeB.on("Burned", async (sender, amount, targetChain, recipient) => {
        if(targetChain === "ChainA"){
            console.log(`\n🔥 [B->A] Burned ${ethers.formatUnits(amount, 18)} tokens from ${sender} for ${recipient}`);
            try {
                const tx = await bridgeA.unlockTokens(recipient, amount);
                await tx.wait();
                console.log(`✅ [B->A] Unlocked ${ethers.formatUnits(amount, 18)} tokens to ${recipient} on Chain A`);
            } catch (err) {
                console.error("❌ Error unlocking on Chain A:", err);
            }
        }
    });
}


main();
