buildTree:
	node scripts/buildTree.js

makeWitness:
	node scripts/makeWitness.js data/input_voter.json

buildWitness:
	snarkjs groth16 prove build/merkleInclusion_final.zkey build/witness.wtns proof.json public.json

verifyProof:
	snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

submitVote:
	node scripts/submitVote.js

tallyVotes:
	node scripts/tally.js
	
.PHONY: buildTree makeWitness buildWitness verifyProof submitVote tallyVotes