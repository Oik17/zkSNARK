const fs = require("fs");
const { groth16 } = require("snarkjs");

// Minimal ballot
const ballot = { electionId: "2025", choice: "Alice" };

// Load proof + public signals + verification key
const proof = JSON.parse(fs.readFileSync("build/proof.json", "utf8"));
const pub = JSON.parse(fs.readFileSync("build/public.json", "utf8"));
const vkey = JSON.parse(fs.readFileSync("build/verification_key.json", "utf8"));

(async () => {
  const ok = await groth16.verify(vkey, pub, proof);
  if (!ok) {
    console.error("❌ Proof invalid. Vote rejected.");
    process.exit(1);
  }
  console.log("✅ Proof valid. Vote accepted.");

  // Append to ledger
  const path = "ledger/votes.json";
  let arr = [];
  if (fs.existsSync(path)) arr = JSON.parse(fs.readFileSync(path, "utf8"));
  arr.push({
    ballot,
    proof: "(omitted here)", // keep it light
    publicSignals: pub,
    ts: Date.now(),
  });
  fs.writeFileSync(path, JSON.stringify(arr, null, 2));
  console.log("📜 Appended to ledger/votes.json");
})();
