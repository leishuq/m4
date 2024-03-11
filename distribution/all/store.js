let context = {};
const util = require('../util/util');

let store = (config) => {
  context.gid = config.gid || 'all'; // node group

  context.hash = config.hash || util.naiveHash; // hash function

  return {get: () => {}, put: () => {}, del: () => {}, reconf: () => {}};
};

module.exports = store;
