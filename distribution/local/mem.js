const id = require('../util/id');

const mem = {};

let hashmap = new Map();
let keymap = new Map();

mem.put = function (user, key, callback) {
  if (key == null) {
    key = id.getID(user);
  }
  const KID = id.getID(key);
  hashmap.set(KID, user);
  keymap.set(key, KID);
  callback = callback || function () {};

  return callback(null, user); // return the group of nodes
};

mem.get = function (key, callback) {
  callback = callback || function () {};

  // if no key, return all the keys in the map
  if (key == null) {
    let keysArr = [...keymap.keys()];
    return callback(null, keysArr);
  } else if (!hashmap.has(key)) {
    return callback(new Error(), null);
  } else {
    const KID = id.getID(key);
    return callback(null, hashmap.get(KID));
  }
};

mem.delete = function (key, callback) {
  callback = callback || function () {};

  if (key == null || !hashmap.has(key)) {
    return callback(new Error(), null);
  } else {
    const KID = id.getID(key);
    const user = hashmap.get(KID);
    hashmap.delete(KID);
    keymap.delete(key);
    return callback(null, user);
  }
};
