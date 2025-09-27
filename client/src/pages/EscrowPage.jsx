import React, { useState } from "react";
import DepositForm from './Deposite';
import ActiveDepositsList from './Details';

export default function EscrowPage() {
  const [activeTab, setActiveTab] = useState("deposit");

  return (
    <div className="max-w-full mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6"> Dashboard</h1>

  
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("deposit")}
          className={`px-4 py-2 rounded ${
            activeTab === "deposit" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded ${
            activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Active Deposits
        </button>
      </div>

     
      {activeTab === "deposit" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">New Deposit</h2>
          <DepositForm />
        </div>
      )}

      {activeTab === "active" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Active Deposits</h2>
          <ActiveDepositsList />
        </div>
      )}
    </div>
  );
}
