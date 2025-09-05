// scripts/writeCircuit.js
// Run: node scripts/writeCircuit.js
const fs = require("fs");
const path = require("path");

const content = `pragma circom 2.1.9;
include "node_modules/circomlib/circuits/poseidon.circom";

template MerkleInclusion(depth) {
    // Public inputs
    signal input root;
    signal output nullifier;

    // Private inputs
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input secret;
    signal input electionId;

    component hasher[depth];
    var i;
    signal cur;
    cur <== leaf;

    for (i = 0; i < depth; i++) {
        hasher[i] = Poseidon(2);

        signal left = (1 - pathIndices[i]) * cur + pathIndices[i] * pathElements[i];
        signal right = (1 - pathIndices[i]) * pathElements[i] + pathIndices[i] * cur;

        hasher[i].inputs[0] <== left;
        hasher[i].inputs[1] <== right;

        cur <== hasher[i].out;
    }

    // enforce reconstructed root == public root
    cur === root;

    // compute nullifier = Poseidon(secret, electionId)
    component nf = Poseidon(2);
    nf.inputs[0] <== secret;
    nf.inputs[1] <== electionId;
    nullifier <== nf.out;
}

component main = MerkleInclusion(16);
`;

const outDir = path.join(__dirname, "..", "circuits");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, "merkleInclusion.circom");
fs.writeFileSync(outPath, content, { encoding: "utf8" });

console.log("Wrote:", outPath);
