// scripts/makeWitness.js
const fs = require("fs");
const { execSync } = require("child_process");

const DEPTH = 3; // must match circuit

const raw = JSON.parse(fs.readFileSync("data/input_voter3.json", "utf8"));

const input = {
  root: raw.root,
  leaf: raw.leaf,
  secret: raw.secret,
  electionId: raw.electionId,
  pathElements: raw.pathElements.slice(0, DEPTH).map(x => x.toString()),
  pathIndices: raw.pathIndices.slice(0, DEPTH).map(Number),
};

fs.writeFileSync(
  "data/witness_input.json",
  JSON.stringify(input, null, 2)
);
console.log("📝 witness_input.json prepared");

execSync(
  `node build/merkleInclusion_js/generate_witness.js build/merkleInclusion_js/merkleInclusion.wasm data/witness_input.json build/witness.wtns`,
  { stdio: "inherit" }
);

console.log("✅ Witness built at build/witness.wtns");
