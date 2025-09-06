include "lib/poseidon.circom";

template MerkleInclusion(depth) {
    // Public input
    signal input root;
    signal output nullifier;

    // Private inputs
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input secret;
    signal input electionId;

    // Helpers
    component hasher[depth];

    // intermediate signals (declared outside loop)
    signal left[depth];
    signal right[depth];
    signal isRight[depth];
    signal notRight[depth];
    signal a[depth];
    signal b[depth];
    signal c[depth];
    signal d[depth];

    // cur array: cur[0] = leaf, cur[i+1] = hash(left_i, right_i)
    signal cur[depth + 1];

    // initialize
    cur[0] <== leaf;

    var i;
    for (i = 0; i < depth; i++) {
        // enforce path bit is boolean
        isRight[i] <== pathIndices[i];
        isRight[i] * (isRight[i] - 1) === 0;

        // notRight = 1 - isRight
        notRight[i] <== 1 - isRight[i];

        // compute left = cur[i]*(1 - isRight) + pathElement*isRight
        a[i] <== cur[i] * notRight[i];
        b[i] <== pathElements[i] * isRight[i];
        left[i] <== a[i] + b[i];

        // compute right = cur[i]*isRight + pathElement*(1 - isRight)
        c[i] <== cur[i] * isRight[i];
        d[i] <== pathElements[i] * notRight[i];
        right[i] <== c[i] + d[i];

        // hash pair
        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== left[i];
        hasher[i].inputs[1] <== right[i];

        // set next cur
        cur[i + 1] <== hasher[i].out;
    }

    // final root must equal provided root
    cur[depth] === root;

    // compute nullifier = Poseidon(secret, electionId)
    component nf = Poseidon(2);
    nf.inputs[0] <== secret;
    nf.inputs[1] <== electionId;
    nullifier <== nf.out;
}

component main = MerkleInclusion(3);