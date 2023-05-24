const fs = require('fs');
const util = require('util');

util.promisify(fs.rm)('./dist', { recursive: true, force: true });
