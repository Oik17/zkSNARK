include "lib/poseidon.circom";

template MerkleInclusion(depth) {
    signal input root;
    signal output nullifier;

    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input secret;
    signal input electionId;

    component hasher[depth];

    signal left[depth];
    signal right[depth];
    signal isRight[depth];
    signal notRight[depth];
    signal a[depth];
    signal b[depth];
    signal c[depth];
    signal d[depth];

    signal cur[depth + 1];

    cur[0] <== leaf;

    var i;
    for (i = 0; i < depth; i++) {
        isRight[i] <== pathIndices[i];
        isRight[i] * (isRight[i] - 1) === 0;

        notRight[i] <== 1 - isRight[i];

        a[i] <== cur[i] * notRight[i];
        b[i] <== pathElements[i] * isRight[i];
        left[i] <== a[i] + b[i];

        c[i] <== cur[i] * isRight[i];
        d[i] <== pathElements[i] * notRight[i];
        right[i] <== c[i] + d[i];

        hasher[i] = Poseidon(2);
        hasher[i].inputs[0] <== left[i];
        hasher[i].inputs[1] <== right[i];

        cur[i + 1] <== hasher[i].out;
    }

    cur[depth] === root;

    component nf = Poseidon(2);
    nf.inputs[0] <== secret;
    nf.inputs[1] <== electionId;
    nullifier <== nf.out;
}

component main = MerkleInclusion(3);