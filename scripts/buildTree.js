const fs = require("fs");
const circomlibjs = require("circomlibjs");
const { MerkleTree } = require("merkletreejs");

function toBuffer32(bi) {
  let hex = bi.toString(16).padStart(64, "0");
  return Buffer.from(hex, "hex");
}

(async () => {
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;

  function poseidonHashBigint(inputs) {
    const res = poseidon(inputs);
    return BigInt(F.toString(res));
  }

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

  // compute leaf = Poseidon(secret, electionId)
  const leavesBI = voters.map(v =>
    poseidonHashBigint([v.secret, electionId])
  );

  // build tree
  function poseidonHashBuffer(data) {
    const leftBI = BigInt("0x" + data.slice(0, 32).toString("hex"));
    const rightBI = BigInt("0x" + data.slice(32).toString("hex"));
    return toBuffer32(poseidonHashBigint([leftBI, rightBI]));
  }

  const leavesBuf = leavesBI.map(toBuffer32);

  const tree = new MerkleTree(leavesBuf, poseidonHashBuffer, {
    hashLeaves: false,
    sortPairs: false,
  });

  const rootDecimal = BigInt("0x" + tree.getRoot().toString("hex")).toString();
  console.log("MERKLE ROOT (decimal):", rootDecimal);

  // pick V3
  let leafIndex = 2;
  const leafDecimal = leavesBI[leafIndex].toString();
  const voter = voters[leafIndex];

  // manually generate path elements in decimal strings
  const pathElements = [];
  const pathIndices = [];

  let index = leafIndex;
  let level = [...leavesBI];
  const DEPTH = 3; 

  for (let d = 0; d < DEPTH; d++) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
    const sibling = siblingIndex < level.length ? level[siblingIndex] : 0n;

    pathElements.push(sibling.toString());
    pathIndices.push(index % 2); // 0 = left, 1 = right

    // compute next level
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : 0n;
      nextLevel.push(poseidonHashBigint([left, right]));
    }
    level = nextLevel;
    index = Math.floor(index / 2);
}


  const input = {
    root: rootDecimal,
    leaf: leafDecimal,
    pathElements,
    pathIndices,
    secret: voter.secret.toString(),
    electionId: electionId.toString(),
  };

  if (!fs.existsSync("data")) fs.mkdirSync("data");
  fs.writeFileSync("data/input_voter3.json", JSON.stringify(input, null, 2));
  console.log("✅ Wrote data/input_voter3.json (decimal numbers)");
})();
