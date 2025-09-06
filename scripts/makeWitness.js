const fs = require("fs");
const { execSync } = require("child_process");

const DEPTH = 16; // must match your circuit

// Load the input prepared earlier
const raw = JSON.parse(fs.readFileSync("data/input_voter3.json", "utf8"));

// Convert hex -> decimal string (snarkjs requires this)
function hexToDec(x) {
  return BigInt(x).toString(10);
}

// Pad proof arrays
function padArray(arr, len) {
  const padded = [...arr];
  while (padded.length < len) padded.push("0x0");
  return padded.slice(0, len);
}

// Prepare the final input object
const input = {
  root: hexToDec(raw.root),
  leaf: hexToDec(raw.leaf),
  pathElements: padArray(raw.pathElements, DEPTH).map(hexToDec),
  pathIndices: padArray(raw.pathIndices, DEPTH).map(x =>
    typeof x === "string" ? BigInt(x).toString(10) : x.toString()
  ),
};

// Save input JSON for witness gen
fs.writeFileSync("data/witness_input.json", JSON.stringify(input, null, 2));

// Call witness generator (compiled by Circom)
execSync(
  `node build/merkleInclusion_js/generate_witness.js build/merkleInclusion_js/merkleInclusion.wasm data/witness_input.json build/witness.wtns`,
  { stdio: "inherit" }
);

console.log("✅ Witness built at build/witness.wtns");
