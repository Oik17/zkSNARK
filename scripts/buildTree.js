// scripts/buildTree.js
// Run with: node scripts/buildTree.js

const fs = require("fs");
const circomlibjs = require("circomlibjs");
const { MerkleTree } = require("merkletreejs");

// helper: bigint -> 32 byte buffer
function toBuffer32(bi) {
  let hex = bi.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  // pad to 64 hex chars (32 bytes)
  hex = hex.padStart(64, "0");
  return Buffer.from(hex, "hex");
}

(async function main() {
  // Build Poseidon (async)
  const poseidon = await circomlibjs.buildPoseidon(); // returns poseidon function + .F
  const F = poseidon.F;

  function poseidonHashBigint(inputs /* array of BigInt */) {
    // poseidon expects array of BigInt-ish values
    const res = poseidon(inputs);
    // res is a field element (object); convert with F.toString
    const bi = BigInt(F.toString(res));
    return bi;
  }

  // Example electionId and secrets (use big randoms in real usage)
  const electionId = 2025n;
  const voters = [
    { name: "V1", secret: 1111111111111111111n },
    { name: "V2", secret: 2222222222222222222n },
    { name: "V3", secret: 3333333333333333333n },
    { name: "V4", secret: 4444444444444444444n },
    { name: "V5", secret: 5555555555555555555n },
    { name: "V6", secret: 6666666666666666666n },
    { name: "V7", secret: 7777777777777777777n },
    { name: "V8", secret: 8888888888888888888n },
  ];

  // Compute leaf = Poseidon(secret, electionId)
  const leaves = voters.map(v => {
    const h = poseidonHashBigint([v.secret, electionId]);
    return toBuffer32(h);
  });

  // custom poseidon hash function for merkletree internal nodes
  function poseidonHashBuffer(data) {
    // merkletreejs will pass the concatenated Buffer of (left+right).
    // We split the buffer in half to get left and right node bytes.
    // For leaf nodes, merkletreejs will not call hashFn if hashLeaves:false.
    const half = data.length / 2;
    const left = data.slice(0, half);
    const right = data.slice(half);
    const leftBI = BigInt("0x" + left.toString("hex"));
    const rightBI = BigInt("0x" + right.toString("hex"));
    const h = poseidonHashBigint([leftBI, rightBI]);
    return toBuffer32(h);
  }

  // Build Merkle tree using our poseidon hash for internal nodes
  const tree = new MerkleTree(leaves, poseidonHashBuffer, { hashLeaves: false, sortPairs: true });

  const root = tree.getRoot(); // Buffer
  const rootHex = "0x" + root.toString("hex");
  console.log("MERKLE ROOT:", rootHex);

  // pick a demo voter (index 2 -> V3)
  const idx = 2;
  const leaf = leaves[idx];

  // Extract proof (array of sibling nodes)
  const proof = tree.getProof(leaf); // array of { position, data }
  const pathElements = proof.map(p => "0x" + p.data.toString("hex"));
  const pathIndices = proof.map(p => (p.position === "right" ? 1 : 0));

  const input = {
    root: rootHex,
    leaf: "0x" + leaf.toString("hex"),
    pathElements,
    pathIndices,
    electionId: electionId.toString(),
    // secret not written here (sensitive) — you'll add it to witness input later
  };

  if (!fs.existsSync("data")) fs.mkdirSync("data");
  fs.writeFileSync("data/input_voter3.json", JSON.stringify(input, null, 2));
  console.log("Wrote data/input_voter3.json");
})();
