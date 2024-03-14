const id = require('../util/id');

let store = (config) => {
  let context = {};
  context.gid = config.gid || 'all'; // node group

  context.hash = config.hash || id.naiveHash; // hash function

  return {
    get: (key, callback) => {
      if (key === null) {
        const remote = {service: 'store', method: 'get'};

        global.distribution[context.gid].comm.send(
            [{key: key, gid: context.gid}],
            remote,
            (e, v) => {
              callback(e, Object.values(v).flat());
            },
        );
      } else {
        let KID;
        KID = id.getID(key);
        global.distribution.local.groups.get(context.gid, (e, nodes) => {
          if (e) {
            return callback(new Error('Failed to get group nodes'), null);
          }
          console.log('current gid get', context.gid, nodes);
          const nid = context.hash(KID, Object.keys(nodes));
          const remote = {node: nodes[nid], service: 'store', method: 'get'};
          console.log(key, 'getting from ', nodes[nid]);
          global.distribution.local.comm.send(
              [{key: key, gid: context.gid}],
              remote,
              callback,
          );
        });
      }
    },
    put: (user, key, callback) => {
      if (key === null) {
        key = id.getID(user);
      }
      const KID = id.getID(key);
      global.distribution.local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes));
        const remote = {node: nodes[nid], service: 'store', method: 'put'};
        console.log('current gid put', context.gid, nodes);
        console.log(key, 'putting to ', nodes[nid]);
        global.distribution.local.comm.send(
            [user, {key: key, gid: context.gid}],
            remote,
            callback,
        );
      });
    },
    del: (key, callback) => {
      const KID = id.getID(key);
      global.distribution.local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes));
        const remote = {node: nodes[nid], service: 'store', method: 'del'};
        global.distribution.local.comm.send(
            [{key: key, gid: context.gid}],
            remote,
            callback,
        );
      });
    },
    reconf: () => {},
  };
};
module.exports = store;
