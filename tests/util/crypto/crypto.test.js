
const {fileHash} = require('../../../packages/utils/dist/cjs/crypto/lib.js');

const h = new fileHash("hello");
console.log(Buffer.from(h.hash()).toString("hex"));
