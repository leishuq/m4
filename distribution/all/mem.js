const local = require('../local/local');
const id = require('../util/id');

let mem = (config) => {
  let context = {}; // Ensure context is encapsulated within each service instance
  context.gid = config.gid || 'all'; // Default to 'all' if no gid is provided
  context.hash = config.hash || id.naiveHash; // Default to naiveHash if no hash function is provided
  return {
    put: (user, key, callback) => {
      const KID = key === null ? id.getID(user) : id.getID(key); // Use the key if provided, else hash the user object
      local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes)); // Hash to decide the node
        const remote = {node: nodes[nid], service: 'mem', method: 'put'};
        local.comm.send([user, {key: key, gid: context.gid}], remote, callback); // Use KID for consistency
      });
    },

    get: (key, callback) => {
      if (key === null) {
        const remote = {service: 'mem', method: 'get'};

        global.distribution[context.gid].groups.get(context.gid, (e, v) => {
          // all the nodes in this gid
          if (e) {
            return callback(new Error(), null);
          } else {
            console.log(v, '!!!');
          }
        });
      } else {
        const KID = id.getID(key);
        local.groups.get(context.gid, (e, nodes) => {
          if (e) {
            return callback(new Error('Failed to get group nodes'), null);
          }
          const nid = context.hash(KID, Object.keys(nodes));
          const remote = {node: nodes[nid], service: 'mem', method: 'get'};
          local.comm.send([{key: key, gid: context.gid}], remote, callback);
        });
      }
    },

    del: (key, callback) => {
      const KID = id.getID(key);
      local.groups.get(context.gid, (e, nodes) => {
        if (e) {
          return callback(new Error('Failed to get group nodes'), null);
        }
        const nid = context.hash(KID, Object.keys(nodes));
        const remote = {node: nodes[nid], service: 'mem', method: 'del'};
        local.comm.send([{key: key, gid: context.gid}], remote, callback);
      });
    },

    reconf: (newConfig, callback) => {
      callback = callback || function () {};
      if (newConfig.hash) context.hash = newConfig.hash;
      callback(null, 'Reconfiguration done');
    },
  };
};

module.exports = mem;
