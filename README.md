# SafuPay  

SafuPay is a secure, cross-chain payment and escrow protocol built on [Kadena’s multichain EVM architecture](https://kadena.io/). It enables seamless token transfers across chains while ensuring fund safety with an on-chain escrow system.  


## 🚀 Features  

- **Cross-Chain Bridge** – Transfers assets between Kadena chains without duplication or double-spending.  
- **Escrow Security** – Uses `keccak256` verification and dual-proof validation to protect transactions.  
- **Time-Locked Safeguards** – Funds can be reclaimed if unclaimed or not finalized in time.  
- **Auto Verification** – Contracts deployed under [Scaffold-Kadena](https://github.com/kadena-community/scaffold-kadena), making deployment and on-chain verification simple and transparent.  
- **Trustless by Design** – Funds are only released when both wallet signature and encrypted claim code are validated.  


## 🏗️ Architecture  

- **BridgeA (Chain 20)** – Locks and burns tokens during transfer initiation.  
- **BridgeB (Chain 21)** – Mints and unlocks tokens upon valid proof submission.  
- **Escrow Module** – Manages funds securely with time-based fallback mechanisms.  
- **Relayer** – Facilitates proof submission across chains without custody of funds.  



## ⚙️ Deployment  

SafuPay contracts are deployed using the [Scaffold-Kadena framework](https://github.com/kadena-community/scaffold-kadena), which automates compilation, deployment, and verification across multiple chains.  

- Framework ensures smooth developer experience.  
- Provides **auto-verification** on deployment.  
- Reduces manual setup and simplifies testing.  

### 🔗 Deployed Contracts  

- **BridgeA (Chain 20):** [0x37e988e9b8862AB026D76c3fE7100974dbb3B3e7](https://chain-20.evm-testnet-blockscout.chainweb.com/address/0x37e988e9b8862AB026D76c3fE7100974dbb3B3e7?tab=contract)  
- **BridgeB (Chain 21):** [0x0eb2825fF6B58a8469DF9Cb865DE579A0600F72C](https://chain-21.evm-testnet-blockscout.chainweb.com/address/0x0eb2825fF6B58a8469DF9Cb865DE579A0600F72C?tab=contract)  



## 📦 Getting Started  

Clone the repository:  
```bash
git clone https://github.com/your-username/safupay.git
cd safupay
