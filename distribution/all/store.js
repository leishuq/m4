const id = require('../util/id');

let store = (config) => {
  let context = {};
  context.gid = config.gid || 'all';

  context.hash = config.hash || id.naiveHash;

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
    reconf: (oldGroupNodes, callback) => {
      callback = callback || function() {};
      const keys = [];
      const keyNodeObj = {};
      const nids = [];
      const newnids = [];

      let cnt = 0;
      Object.keys(oldGroupNodes).forEach((sid) => {
        const node = oldGroupNodes[sid];
        const nid = id.getNID(node);
        nids.push(nid);
        const remote = {node: node, service: 'store', method: 'get'};
        console.log('node', node);
        global.distribution.local.comm.send(
            [{key: null, gid: context.gid}],
            remote,
            (e, nodeKeys) => {
              if (e) {
                callback(e);
              }
              console.log('keys!!!!!!', nodeKeys);
              keys.push(...nodeKeys);
              cnt++;
              if (cnt == Object.keys(oldGroupNodes).length) {
                console.log('all keys', keys);
                keys.forEach((key) => {
                  const KID = id.getID(key);
                  const nid = context.hash(KID, nids);
                  const k = key;
                  keyNodeObj[k] = nid;
                });

                distribution.local.groups.get(context.gid, (e, obj) => {
                  Object.values(obj).forEach((node) => {
                    const nid = id.getNID(node);
                    newnids.push(nid);
                  });

                  keys.forEach((key) => {
                    const KID = id.getID(key);
                    const nid = context.hash(KID, newnids);
                    const k = key;
                    // newKeyNodeObj[k] = nid;
                    if (keyNodeObj[k] != nid) {
                      const oldsid = keyNodeObj[k].substring(0, 5);
                      const newsid = nid.substring(0, 5);
                      const remote = {
                        node: oldGroupNodes[oldsid],
                        service: 'store',
                        method: 'del',
                      };
                      global.distribution.local.comm.send(
                          [{key: key, gid: context.gid}],
                          remote,
                          (e, v) => {
                            const remote = {
                              node: obj[newsid],
                              service: 'store',
                              method: 'put',
                            };
                            global.distribution.local.comm.send(
                                [v, {key: key, gid: context.gid}],
                                remote,
                                (e, v) => {
                                  callback(null, 'Reconfiguration done');
                                },
                            );
                          },
                      );
                    }
                  });
                });
              }
            },
        );
      });
    },
  };
};
module.exports = store;
