const id = require('../util/id');

let mem = (config) => {
  let context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || id.naiveHash;
  return {
    put: (user, key, callback) => {
      if (key === null) {
        key = id.getID(user);
      }
      const KID = id.getID(key);
      distribution.local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes));
        const remote = {node: nodes[nid], service: 'mem', method: 'put'};
        distribution.local.comm.send(
          [user, {key: key, gid: context.gid}],
          remote,
          callback,
        );
      });
    },

    get: (key, callback) => {
      if (key === null) {
        const remote = {service: 'mem', method: 'get'};

        global.distribution[context.gid].comm.send(
          [{key: key, gid: context.gid}],
          remote,
          (e, v) => {
            callback(e, Object.values(v).flat());
          },
        );
      } else {
        const KID = id.getID(key);
        distribution.local.groups.get(context.gid, (e, nodes) => {
          if (e) {
            return callback(new Error('Failed to get group nodes'), null);
          }
          const nid = context.hash(KID, Object.keys(nodes));
          const remote = {node: nodes[nid], service: 'mem', method: 'get'};
          distribution.local.comm.send(
            [{key: key, gid: context.gid}],
            remote,
            callback,
          );
        });
      }
    },

    del: (key, callback) => {
      const KID = id.getID(key);
      distribution.local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes));
        const remote = {node: nodes[nid], service: 'mem', method: 'del'};
        distribution.local.comm.send(
          [{key: key, gid: context.gid}],
          remote,
          callback,
        );
      });
    },

    reconf: (newConfig, callback) => {
      callback = callback || function () {};
      callback(null, 'Reconfiguration done');
    },
  };
};

module.exports = mem;
