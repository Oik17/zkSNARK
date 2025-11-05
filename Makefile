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
	node scripts/tally.jsx	

compileCircuit:
	circom circuits/merkleInclusion.circom --r1cs --wasm --sym -o build/merkleInclusion_js

powersOfTau1:
	snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

powersOfTau2:
	snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

powersOfTau3:
	snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

generateProvingKey:
	snarkjs groth16 setup build/merkleInclusion_js/merkleInclusion.r1cs pot12_final.ptau build/merkleInclusion_js/merkleInclusion_0000.zkey

generateProvingKey1:
	snarkjs zkey contribute build/merkleInclusion_js/merkleInclusion_0000.zkey build/merkleInclusion_js/merkleInclusion_final.zkey --name="Key Contributor" -v

generateProvingKey2:
	snarkjs zkey export verificationkey build/merkleInclusion_js/merkleInclusion_final.zkey build/merkleInclusion_js/verification_key.json

.PHONY: buildTree makeWitness buildWitness verifyProof submitVote tallyVotes compileCircuit powersOfTau1 powersOfTau2 powersOfTau3 generateProvingKey generateProvingKey1 generateProvingKey2