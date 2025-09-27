// import express from "express";
// import { ethers } from "ethers";
// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// import { networks } from "./config.js";
// import cors from "cors";
// dotenv.config();

// const app = express();
// const PORT = 4000;


// app.use(cors());
// app.use(express.json());


// const db = await mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
// });


// const abi = [
//   "event DepositCreated(uint256 indexed id,uint256 indexed chainId,address indexed sender,address recipient,address token,uint256 amount,bytes32 claimHash,uint256 createdAt)",
//   "event Claimed(uint256 indexed id,uint256 indexed chainId,address indexed recipient,uint256 amount,address token)",
//   "event Cancelled(uint256 indexed id,address indexed sender)",
//   "event Reclaimed(uint256 indexed id,address indexed sender)"
// ];

// function setupListeners(network) {
//   const provider = new ethers.JsonRpcProvider(network.rpc);
//   const contract = new ethers.Contract(network.contract, abi, provider);
//   console.log("contract details",network.contract,abi);
//   console.log(` Listening on ${network.name} (chainId=${network.chainId})`);

// //   contract.on("DepositCreated", async (id, chainId, sender, recipient, token, amount, claimHash, createdAt) => {
// //     console.log(`[${network.name}] DepositCreated: ID=${id} Sender=${sender}`);
// //     try {
// //       await db.query(
// //         `INSERT INTO deposits (id, chainId, sender, recipient, token, amount, claimHash, createdAt, status) 
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
// //          ON DUPLICATE KEY UPDATE status='active'`,
// //         [id.toString(), chainId.toString(), sender, recipient, token, amount.toString(), claimHash, createdAt.toString(), "active"]
// //       );
// //     } catch (err) {
// //       console.error("DB Error:", err);
// //     }
// //   });


// contract.on(
//   "DepositCreated",
//   async (id, chainId, sender, recipient, token, amount, claimHash, createdAt) => {
//     console.log(`[${network.name}] DepositCreated: ID=${id} Sender=${sender}`);
//     try {
//       const [result] = await db.query(
//         `INSERT INTO deposits (id, chainId, sender, recipient, token, amount, claimHash, createdAt, status) 
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
//          ON DUPLICATE KEY UPDATE status='active'`,
//         [
//           id.toString(),
//           chainId.toString(),
//           sender,
//           recipient,
//           token,
//           amount.toString(),
//           claimHash,
//           createdAt.toString(),
//           "active",
//         ]
//       );

//       console.log("[DB] Insert/Update Result:", result);
//     } catch (err) {
//       console.error("[DB Error on DepositCreated]:", err);
//     }
//   }
// );

//   contract.on("Claimed", async (id, chainId, recipient, amount, token) => {
//     if(chainId == 21){
//         chainId = 5921;
//     }
//     console.log(`[${network.name}] Claimed: ID=${id} Recipient=${recipient}`);
//     try {
//       await db.query(`UPDATE deposits SET status='claimed' WHERE id=? AND chainId=?`, [
//         id.toString(),
//         chainId.toString(),
//       ]);
//     } catch (err) {
//       console.error("DB Error:", err);
//     }
//   });

// contract.on("Cancelled", async (id, sender) => {
//   let chainId = network.chainId.toString();
//    if(chainId == "21"){
//         chainId = "5921";
//     }
  
//   console.log(`[${network.name}] Cancelled: ID=${id} Sender=${sender} ChainId=${chainId}`);

//   try {
//     const [rows] = await db.query(
//       `SELECT * FROM deposits WHERE id=?`,
//       [id.toString()]
//     );
//     console.log(`[DB] Found Rows:`, rows);

//     const [result] = await db.query(
//       `UPDATE deposits SET status='cancelled' WHERE id=? AND sender=? AND chainId=?`,
//       [id.toString(), sender, chainId]
//     );
//     console.log(`[DB] Updated Rows:`, result.affectedRows);
//   } catch (err) {
//     console.error("DB Error:", err);
//   }
// });


//   contract.on("Reclaimed", async (id, sender) => {
//      if(chainId == 21){
//         chainId = 5921;
//     }
//     console.log(`[${network.name}] Reclaimed: ID=${id}`);
//     try {
//       await db.query(`UPDATE deposits SET status='reclaimed' WHERE id=? AND sender=? AND chainId=?`, [
//         id.toString(),
//         sender,
//         network.chainId.toString(),
//       ]);
//     } catch (err) {
//       console.error("DB Error:", err);
//     }
//   });
// }

// networks.forEach(setupListeners);


// // Get deposits by recipient with optional status filter
// app.get("/deposits/:recipient", async (req, res) => {
//   const { recipient } = req.params;
//   const { status = "all" } = req.query;

//   try {
//     let query = "SELECT * FROM deposits WHERE recipient = ?";
//     const params = [recipient];

//     if (status !== "all") {
//       query += " AND status = ?";
//       params.push(status);
//     }

//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("DB Error:", err);
//     res.status(500).json({ error: "Database query failed" });
//   }
// });

// app.get("/deposits/:sender", async (req, res) => {
//   const { sender } = req.params;
//   const { status = "all" } = req.query;

//   try {
//     let query = "SELECT * FROM deposits WHERE sender = ?";
//     const params = [sender];

//     if (status !== "all") {
//       query += " AND status = ?";
//       params.push(status);
//     }

//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error("DB Error:", err);
//     res.status(500).json({ error: "Database query failed" });
//   }
// });


// app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

import express from "express";
import { ethers } from "ethers";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { networks } from "./config.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const abi = [
  "event DepositCreated(uint256 indexed id,uint256 indexed chainId,address indexed sender,address recipient,address token,uint256 amount,bytes32 claimHash,uint256 createdAt)",
  "event Claimed(uint256 indexed id,uint256 indexed chainId,address indexed recipient,uint256 amount,address token)",
  "event Cancelled(uint256 indexed id,address indexed sender)",
  "event Reclaimed(uint256 indexed id,address indexed sender)"
];

function setupListeners(network) {
  const provider = new ethers.JsonRpcProvider(network.rpc);
  const contract = new ethers.Contract(network.contract, abi, provider);
  console.log("Contract details", network.contract);
  console.log(`Listening on ${network.name} (chainId=${network.chainId})`);

  contract.on(
    "DepositCreated",
    async (id, chainId, sender, recipient, token, amount, claimHash, createdAt) => {
      console.log(`[${network.name}] DepositCreated: ID=${id} Sender=${sender}`);
      try {
        const [result] = await db.query(
          `INSERT INTO deposits (id, chainId, sender, recipient, token, amount, claimHash, createdAt, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE status='active'`,
          [
            id.toString(),
            chainId.toString(),
            sender,
            recipient,
            token,
            amount.toString(),
            claimHash,
            createdAt.toString(),
            "active",
          ]
        );
        console.log("[DB] Insert/Update Result:", result);
      } catch (err) {
        console.error("[DB Error on DepositCreated]:", err);
      }
    }
  );

  contract.on("Claimed", async (id, chainId, recipient, amount, token) => {
    let chainIdStr = chainId.toString();
    if (chainIdStr === "21") chainIdStr = "5921";

    console.log(`[${network.name}] Claimed: ID=${id} Recipient=${recipient}`);
    try {
      await db.query(`UPDATE deposits SET status='claimed' WHERE id=? AND chainId=?`, [
        id.toString(),
        chainIdStr,
      ]);
    } catch (err) {
      console.error("[DB Error on Claimed]:", err);
    }
  });

  contract.on("Cancelled", async (id, sender) => {
    let chainId = network.chainId.toString();
    if (chainId === "21") chainId = "5921";

    console.log(`[${network.name}] Cancelled: ID=${id} Sender=${sender} ChainId=${chainId}`);

    try {
      const [rows] = await db.query(`SELECT * FROM deposits WHERE id=?`, [id.toString()]);
      console.log(`[DB] Found Rows:`, rows);

      const [result] = await db.query(
        `UPDATE deposits SET status='cancelled' WHERE id=? AND sender=? AND chainId=?`,
        [id.toString(), sender, chainId]
      );
      console.log(`[DB] Updated Rows:`, result.affectedRows);
    } catch (err) {
      console.error("[DB Error on Cancelled]:", err);
    }
  });

  contract.on("Reclaimed", async (id, sender) => {
    let chainId = network.chainId.toString();
    if (chainId === "21") chainId = "5921";

    console.log(`[${network.name}] Reclaimed: ID=${id}`);
    try {
      await db.query(
        `UPDATE deposits SET status='reclaimed' WHERE id=? AND sender=? AND chainId=?`,
        [id.toString(), sender, chainId]
      );
    } catch (err) {
      console.error("[DB Error on Reclaimed]:", err);
    }
  });
}

networks.forEach(setupListeners);


app.get("/deposits/recipient/:recipient", async (req, res) => {
  const { recipient } = req.params;
  const { status = "all" } = req.query;

  try {
    let query = "SELECT * FROM deposits WHERE recipient = ?";
    const params = [recipient];

    if (status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/deposits/sender/:sender", async (req, res) => {
  const { sender } = req.params;
  const { status = "all" } = req.query;

  try {
    let query = "SELECT * FROM deposits WHERE sender = ?";
    const params = [sender];

    if (status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
