const id = require('../util/id');

const mem = {};

let groupMap = new Map();
groupMap.set('local', new Map());

mem.put = function (user, key, callback) {
  let gid = 'local'; // Default group id is 'local'

  if (key == null) {
    key = id.getID(user);
  } else if (typeof key === 'object' && key !== null) {
    gid = key.gid || gid;
    key = key.key;
  }

  // Ensure the group exists in the groupMap
  if (!groupMap.has(gid)) {
    groupMap.set(gid, new Map());
  }

  groupMap.get(gid).set(key, user);

  callback = callback || function () {};

  return callback(null, user);
};

mem.get = function (key, callback) {
  let gid = 'local';
  callback = callback || function () {};

  if (key === null) {
    const map = groupMap.get(gid);
    return callback(null, [...map.keys()]);
  } else if (typeof key === 'object' && key !== null) {
    gid = key.gid || gid;
    key = key.key;
  }

  if (groupMap.has(gid) && groupMap.get(gid).has(key)) {
    return callback(null, groupMap.get(gid).get(key));
  } else {
    return callback(new Error('Key not found'), null);
  }
};

mem.del = function (key, callback) {
  let gid = 'local';
  callback = callback || function () {};

  if (typeof key === 'object' && key !== null) {
    gid = key.gid || gid;
    key = key.key;
  }

  if (groupMap.has(gid) && groupMap.get(gid).has(key)) {
    const user = groupMap.get(gid).get(key);
    groupMap.get(gid).delete(key);
    return callback(null, user);
  } else {
    return callback(new Error('Key not found for deletion'), null);
  }
};

module.exports = mem;
