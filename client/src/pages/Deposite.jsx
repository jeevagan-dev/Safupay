import React, { useState, useEffect } from "react";
import {
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ethers, keccak256, solidityPacked } from "ethers";
import abi from "../contract/abi.json";

const ESCROW_ADDRESS = "0x606FB9b84aBe220cD4a69b8eeCE10fdDD62fB539";
const ESCROW_ABI = abi;

export default function DepositForm({ onSuccess }) {
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [claimHash, setClaimHash] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [msg, setMsg] = useState("");
  const [formResetKey, setFormResetKey] = useState(0);


  useEffect(() => {
    if (msg) setMsg("");
  }, [recipient, amount, claimCode]);

 
  useEffect(() => {
    const computeHash = () => {
      if (!recipient || !claimCode) {
        setClaimHash("");
        return;
      }

      try {
        const packed = solidityPacked(
          ["uint256", "address", "string", "address"],
          [chainId, ESCROW_ADDRESS, claimCode, recipient]
        );
        const hash = keccak256(packed);
        setClaimHash(hash);
      } catch (err) {
        console.error("Hash computation failed:", err);
        setMsg("Failed to compute claim hash.");
        setClaimHash("");
      }
    };

    computeHash();
  }, [recipient, claimCode, chainId]);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });


  useEffect(() => {
    if (isConfirmed) {
      setRecipient("");
      setAmount("");
      setClaimCode("");
      setClaimHash("");
      setTxHash(null);
      setMsg(" Transaction confirmed!");
      setFormResetKey((prev) => prev + 1); 
    }
  }, [isConfirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recipient || !amount || !claimHash) {
      setMsg(" Fill in all fields correctly.");
      return;
    }

    try {
      setMsg("⏳ Sending transaction...");
      const valueInWei = ethers.parseEther(amount);

      const result = await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "createDepositETH",
        args: [recipient, claimHash],
        value: valueInWei,
      });

      console.log("Transaction hash:", result);
      setTxHash(result);
      setMsg("Transaction sent. Waiting for confirmation...");
    } catch (err) {
      console.error("Transaction failed:", err);
      setMsg(" Transaction failed: " + err.message);
    }
  };

  return (
    <div key={formResetKey} className="bg-gray-50 p-4 rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Claim Code (secret)"
          value={claimCode}
          onChange={(e) => setClaimCode(e.target.value)}
          required
        />

      

        <button
          type="submit"
          className={`w-full py-2 rounded text-white ${
            isConfirming ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isConfirming}
        >
          {isConfirming ? "Waiting for Confirmation..." : "Send Deposit"}
        </button>
      </form>

      {txHash && (
        <div className="mt-2 text-sm text-gray-600">
          TX:{" "}
          <a
            href={`https://chain-21.evm-testnet-blockscout.chainweb.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </div>
      )}

      {msg && <div className="mt-2 text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
