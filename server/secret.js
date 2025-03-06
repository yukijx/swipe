const crypto = require('crypto');
const aesSecret = crypto.randomBytes(32).toString('hex');
console.log("Generated AES Secret:", aesSecret);
