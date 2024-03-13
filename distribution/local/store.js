const fs = require('fs');
const path = require('path');
const id = require('../util/id');

// Assuming global.nodeConfig is already defined as per the handout
const conf = id.getNID(global.nodeConfig);
const dirName = path.join(__dirname, conf); // Store directory for this node

// Ensure the storage directory exists
if (!fs.existsSync(dirName)) {
  fs.mkdirSync(dirName, {recursive: true}); // Use recursive to create intermediate directories
}

function getFilePath(key) {
  const safeKey = key.replace(/[^a-z0-9]/gi, '_');
  return path.join(dirName, safeKey);
}

const store = {};

store.put = function (user, key, callback) {
  callback = callback || function () {};

  if (key == null) {
    key = id.getID(user);
  } else if (typeof key === 'object' && key !== null) {
    gid = key.gid;
    key = key.key;
  }

  const filePath = getFilePath(key);
  const data = JSON.stringify(user);
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      return callback(err);
    }
    return callback(null, user);
  });
};

store.get = function (key, callback) {
  callback = callback || function () {};

  if (key == null) {
    // List all files in the directory as keys
    fs.readdir(dirName, (err, files) => {
      if (err) {
        return callback(err);
      }
      return callback(
        null,
        files.map((file) => file.replace(/_/g, '.')),
      ); // Assuming '_' was used as a placeholder for non-alphanumeric characters
    });
  } else {
    const filePath = getFilePath(key);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(new Error('File/key does not exist'));
      }
      return callback(null, JSON.parse(data));
    });
  }
};
store.del = function (key, callback) {
  callback = callback || function () {};

  if (key == null) {
    return callback(new Error('Key is null'), null);
  }

  const filePath = getFilePath(key);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return callback(new Error('File/key does not exist'), null);
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return callback(new Error('Failed to delete file'), null);
      }

      return callback(null, JSON.parse(data));
    });
  });
};

module.exports = store;
