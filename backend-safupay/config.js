import dotenv from "dotenv";
dotenv.config();

export const networks = [
  {
    name: "Kadena Testnet",
    chainId: 21,
    rpc: process.env.RPC_KADENA,
    contract: process.env.CONTRACT_KADENA
  },

];

