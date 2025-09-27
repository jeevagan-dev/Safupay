
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import abi from "../contract/abi.json";

const ESCROW_ADDRESS = "0x606FB9b84aBe220cD4a69b8eeCE10fdDD62fB539";
const ESCROW_ABI = abi;

export default function ActiveDepositsList() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [activeDeposits, setActiveDeposits] = useState([]);
  const [historyDeposits, setHistoryDeposits] = useState([]);
  const [sendingHistory, setSendingHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [claimCodes, setClaimCodes] = useState({}); 

  const handleClaimCodeChange = (depositId, value) => {
    setClaimCodes((prev) => ({
      ...prev,
      [depositId]: value,
    }));
  };


  async function handleClaim(depositId) {
    const claimCode = claimCodes[depositId];

    if (!claimCode || claimCode.trim() === "") {
      setMessage(" Please enter a claim code.");
      return;
    }

    try {
      await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "claim",
        args: [BigInt(depositId), claimCode],
      });
      setMessage(" Claim success!");
    } catch (err) {
      setMessage(" Claim failed: " + err.message);
    }
  }


  async function handleCancel(depositId) {
    try {
      await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "cancelBySender",
        args: [BigInt(depositId)],
      });
      setMessage(" Deposit cancelled!");
    } catch (err) {
      setMessage(" Cancel failed: " + err.message);
    }
  }


  async function handleReclaim(depositId) {
    try {
      await writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "reclaim",
        args: [BigInt(depositId)],
      });
      setMessage(" Deposit reclaimed!");
    } catch (err) {
      setMessage(" Reclaim failed: " + err.message);
    }
  }


  useEffect(() => {
    async function fetchDeposits() {
      if (!address) return;
      try {
        const resActive = await fetch(`http://localhost:4000/deposits/recipient/${address}?status=active`);
        const active = await resActive.json();
        setActiveDeposits(active);

        const resHistory = await fetch(`http://localhost:4000/deposits/recipient/${address}?status=all`);
        const all = await resHistory.json();
        const history = all.filter((d) => d.status !== "active");
        setHistoryDeposits(history);
        const sendHistory = await fetch(`http://localhost:4000/deposits/sender/${address}?status=all`);
        const sending = await sendHistory.json();
        setSendingHistory(sending);
        console.log("Fetched deposits:", { active, history, sending });
      } catch (err) {
        console.error("Failed to fetch deposits:", err);
      }
    }

    fetchDeposits();
  }, [address]);

  if (!activeDeposits || activeDeposits.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 rounded p-3 mt-6">
      <h3 className="font-semibold mb-2">Your Active Deposits</h3>

      {message && (
        <div className="mb-4 p-2 text-sm bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <ul className="space-y-3">
        {activeDeposits.map((dep) => (
          <li key={dep.id} className="p-3 border rounded bg-white">
            <div><strong>ID:</strong> {dep.id} (Chain {dep.chainId})</div>
            <div><strong>Amount:</strong> {ethers.formatEther(dep.amount)} ETH</div>
            <div><strong>Recipient:</strong> {dep.recipient}</div>
            <div><strong>Status:</strong> {dep.status}</div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Claim Code:</label>
              <input
                type="text"
                value={claimCodes[dep.id] || ""}
                onChange={(e) => handleClaimCodeChange(dep.id, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full mt-1"
                placeholder="Enter claim code"
              />
            </div>

            <div className="flex gap-2 mt-3">
              { address && address.toLowerCase() === dep.recipient.toLowerCase() && (
              <>
              <button
                onClick={() => handleClaim(dep.id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Claim
              </button>
            </>
              )}
              { address && address.toLowerCase() === dep.sender.toLowerCase() && (
              <>
              <button
                onClick={() => handleCancel(dep.id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReclaim(dep.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reclaim
              </button>
            </>
            )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

