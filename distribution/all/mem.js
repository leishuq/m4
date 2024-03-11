const local = require('../local/local');
const utils = require('../util/util');
const id = require('../util/id');

let context = {};

let mem = (config) => {
  context.gid = config.gid || 'all'; // node group

  context.hash = config.hash || utils.naiveHash; // hash function param KID NID, return a NID

  // function naiveHash(kid, nids) {
  //   nids.sort();
  //   return nids[idToNum(kid) % nids.length];
  // }
  return {
    put: (user, key, callback) => {
      // const KID = id.getID(key);
      // context.hash();
      // const remote = {
      //   service: 'mem',
      //   method: 'put',
      // };
      // local.mem.put(user, key, (e, v) => {
      //   if (e) {
      //     return callback(e, null);
      //   } else {
      //   }
      // });
    },

    get: (key, callback) => {
      const remote = {
        service: 'mem',
        method: 'get',
      };
    },

    del: (key, callback) => {
      const remote = {
        service: 'mem',
        method: 'del',
      };
    },

    reconf: (callback) => {
      callback = callback || function () {};
    },
  };
};

module.exports = mem;
