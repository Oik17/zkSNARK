const fs = require("fs");

const path = "ledger/votes.json";
if (!fs.existsSync(path)) {
  console.log("No votes yet.");
  process.exit(0);
}

const arr = JSON.parse(fs.readFileSync(path, "utf8"));
const counts = {};

for (const rec of arr) {
  const choice = rec.ballot.choice;
  counts[choice] = (counts[choice] || 0) + 1;
}

console.log("🗳️ Final TALLY:");
for (const [k, v] of Object.entries(counts)) {
  console.log(`${k}: ${v}`);
}
