# zkSNARKS Project

This project demonstrates the implementation and usage of zkSNARKs (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) for privacy-preserving proofs.

## Features

- Example circuits for zkSNARKs
- Proof generation and verification scripts
- Step-by-step workflow for creating and verifying proofs

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- [snarkjs](https://github.com/iden3/snarkjs)
- [circom](https://docs.circom.io/)

## Getting Started

1. **Install dependencies**
    ```bash
    npm install
    ```

2. **Compile the circuit**
    ```bash
    circom circuit.circom --r1cs --wasm --sym
    ```

3. **Generate trusted setup**
    ```bash
    snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_final.zkey
    ```

4. **Generate a proof**
    ```bash
    node generateProof.js
    ```

5. **Verify the proof**
    ```bash
    node verifyProof.js
    ```

## Project Structure

- `circuit.circom` — Main circuit definition
- `generateProof.js` — Script to generate zkSNARK proof
- `verifyProof.js` — Script to verify proof
- `README.md` — Project documentation

## References

- [zkSNARKs Explained](https://zokrates.github.io/introduction.html)
- [snarkjs Documentation](https://github.com/iden3/snarkjs)
- [circom Documentation](https://docs.circom.io/)

## License

MIT License
