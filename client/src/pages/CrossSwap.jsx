import React, { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useBalance,
  useAccount,
  useSwitchChain,   
} from "wagmi";
import { ethers } from "ethers";
import bridgeABI from "../contract/bridgeABI.json";
import erc20ABI from "../contract/erc20ABI.json";


const CHAINS = {
  5920: {
    name: "KDA 20",
    token: "0x4888b2deA99a1F92F3bb29BaE482dC6D79D5E8D8", 
    bridge: "0x37e988e9b8862AB026D76c3fE7100974dbb3B3e7",
    explorer: "https://chain-20.evm-testnet-blockscout.chainweb.com",
  },
  5921: {
    name: "KDA 21",
    token: "0xdc11176f6552D2eC5Da686747E73b2eCDde5BE5e",
    bridge: "0x0eb2825fF6B58a8469DF9Cb865DE579A0600F72C", 
    explorer: "https://chain-21.evm-testnet-blockscout.chainweb.com",
  },
};

export default function CrossChainSwap() {
  const { address } = useAccount();
  const currentChain = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const [source, setSource] = useState("5920"); 
  const [target, setTarget] = useState("5921");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [msg, setMsg] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: CHAINS[source].token,
    chainId: Number(source),
    watch: true,
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setAmount("");
      setRecipient("");
      setMsg(" Swap confirmed on source chain. Relayer will mint/unlock on target chain.");
      setTxHash(null);
      refetchBalance(); 
    }
  }, [isConfirmed, refetchBalance]);

  
  const ensureCorrectChain = async () => {
    if (currentChain !== Number(source)) {
      try {
        await switchChainAsync({ chainId: Number(source) });
      } catch (err) {
        setMsg(" Please switch to " + CHAINS[source].name);
        throw err;
      }
    }
  };

  
  const handleApprove = async () => {
    try {
      await ensureCorrectChain(); 
      setIsApproving(true);

      const tokenAddr = CHAINS[source].token;
      const bridgeAddr = CHAINS[source].bridge;
      const value = ethers.parseUnits(amount || "0", 18);

      const tx = await writeContractAsync({
        address: tokenAddr,
        abi: erc20ABI,
        functionName: "approve",
        args: [bridgeAddr, value],
        chainId: Number(source),
      });

      setTxHash(tx);
      setMsg("Approval transaction sent...");
    } catch (err) {
      console.error(err);
      setMsg(" Approval failed: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };


  const handleSwap = async (e) => {
    e.preventDefault();
    if (!amount || !recipient) {
      setMsg(" Please enter all fields.");
      return;
    }

    try {
      await ensureCorrectChain(); 
      setMsg(" Sending swap transaction...");

      const value = ethers.parseUnits(amount, 18);
      const bridgeAddr = CHAINS[source].bridge;
      const fn = source === "5920" ? "lockTokens" : "burnTokens";
      const targetChain = source === "5920" ? "ChainB" : "ChainA"; 
      const tx = await writeContractAsync({
        address: bridgeAddr,
        abi: bridgeABI,
        functionName: fn,
        args: [value, targetChain, recipient],
        chainId: Number(source),
      });

      setTxHash(tx);
      setMsg(" Swap transaction sent. Waiting confirmation...");
    } catch (err) {
      console.error(err);
      setMsg(" Swap failed: " + err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-5  bg-white p-10 rounded-2xl shadow-lg space-y-5">
      <h2 className="text-2xl font-bold text-gray-800"> Cross-Chain Swap</h2>

   
      <div className="flex items-center space-x-4">
        <select
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setTarget(e.target.value === "5920" ? "5921" : "5920");
          }}
          className="w-1/2 border p-2 rounded"
        >
          {Object.entries(CHAINS).map(([id, c]) => (
            <option key={id} value={id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-gray-500"> {"==>"} </span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-1/2 border p-2 rounded"
        >
          {Object.entries(CHAINS)
            .filter(([id]) => id !== source)
            .map(([id, c]) => (
              <option key={id} value={id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>


      <div className="bg-gray-50 border p-3 rounded text-sm">
        <p className="text-gray-700">
          Balance on {CHAINS[source].name}:{" "}
          <span className="font-semibold">
            {balanceData ? balanceData.formatted : "0"} {balanceData?.symbol}
          </span>
        </p>
      </div>

  
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        className="w-full border p-2 rounded"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

     
    { useAccount && (<div className="flex space-x-3">
        <button
          onClick={handleApprove}
          disabled={isApproving || !amount}
          className={`flex-1 py-2 rounded text-white ${
            isApproving ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>

        <button
          onClick={handleSwap}
          disabled={isConfirming}
          className={`flex-1 py-2 rounded text-white ${
            isConfirming ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isConfirming ? "Swapping..." : "Swap"}
        </button>
      </div>)}


      {txHash && (
        <p className="text-sm text-gray-600">
          TX:{" "}
          <a
            href={`${CHAINS[source].explorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            {txHash.slice(0, 12)}...
          </a>
        </p>
      )}

   
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </div>
  );
}

