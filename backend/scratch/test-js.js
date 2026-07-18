const { validateSpanishID } = require('../dist/utils/validation');
console.log('12345678Z:', validateSpanishID('12345678Z'));
console.log('12345678A:', validateSpanishID('12345678A'));
