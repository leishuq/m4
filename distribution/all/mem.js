const local = require('../local/local');
const utils = require('../util/util');
const id = require('../util/id');
const distribution = require('../../distribution');

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
      // distribution[context.gid].groups.get(context.gid, (e, v) => {
      //   if(e){
      //     return callback(new Error('group get failed'), null);
      //   } else {
      //     //v is list of nodes in the group
      //     const KID = id.getID(key);
      //     // NID?
      //     context.hash(KID, )
      //   }
      // })
      // context.hash();
      // // call
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
