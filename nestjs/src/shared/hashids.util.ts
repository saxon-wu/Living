import Hashids = require('hashids/cjs');
const hashids = new Hashids(process.env.HASHIDS_SALT);

export default hashids;
