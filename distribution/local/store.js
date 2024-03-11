//  ________________________________________
// / NOTE: You should use absolute paths to \
// | make sure they are agnostic to where   |
// | your code is running from! Use the     |
// \ `path` module for that purpose.        /
//  ----------------------------------------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||

const id = require('../util/id');
const fs = require('fs');
const path = require('path');

const conf = id.getNID(global.nodeConfig);
const dirName = '/usr/src/app/m4';

if (!fs.existsSync(dirName)) {
  fs.mkdirSync(dirName); // Create the directory if it does not exist
}

function getFilePath(key) {
  // Replace non-alphanumeric characters with underscores to avoid filesystem issues
  const safeKey = key.replace(/[^a-z0-9]/gi, '_');
  const groupDir = path.join(dirName, conf);
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir); // Create the directory if it does not exist
  }
  const finalPath = path.join(groupDir, safeKey);
  return finalPath;
}

const store = {};

let keymap = new Map();

store.put = function (user, key, callback) {
  callback = callback || function () {};

  if (key == null) {
    key = id.getID(user);
  }
  const filePath = getFilePath(key);
  const data = JSON.stringify(user);
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      return callback(new Error('fail to writeFile'), null);
    } else {
      keymap.set(key, user);
      return callback(null, user);
    }
  });
};

store.get = function (key, callback) {
  callback = callback || function () {};

  // if no key, return all the keys in the map
  if (key == null) {
    let keysArr = [...keymap.keys()];
    return callback(null, keysArr);
  } else {
    const path = getFilePath(key);

    fs.readFile(path, (err, data) => {
      if (err) {
        return callback(new Error('file/key dont exist '), null);
      } else {
        return callback(null, JSON.parse(data));
      }
    });
  }
};

store.del = function (key, callback) {
  callback = callback || function () {};

  if (key == null) {
    return callback(new Error('key is null'), null);
  }
  const path = getFilePath(key);
  fs.readFile(path, (err, data) => {
    if (err) {
      return callback(new Error('file/key does not exist '), null);
    } else {
      fs.unlink(path, (err) => {
        if (err) {
          return callback(new Error('fail to delete file '), null);
        } else {
          keymap.delete(key);
          return callback(null, JSON.parse(data));
        }
      });
    }
  });
};

module.exports = store;
