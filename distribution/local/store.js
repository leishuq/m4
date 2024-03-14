const fs = require('fs');
const path = require('path');
const id = require('../util/id');

const conf = id.getNID(global.nodeConfig);
const dirName = path.join(__dirname, '../../store', conf);

if (!fs.existsSync(dirName)) {
  fs.mkdirSync(dirName, {recursive: true});
}

function getFilePath(gid, key) {
  gid = gid || 'local';
  return path.join(dirName, gid, key);
}

const store = {};

store.put = function(user, key, callback) {
  let gid = 'local';
  callback = callback || function() {};

  if (key === null) {
    key = id.getID(user);
  } else if (typeof key === 'object') {
    gid = key.gid;
    key = key.key;
  }

  const filePath = getFilePath(gid, key);
  if (!fs.existsSync(path.join(dirName, gid))) {
    fs.mkdirSync(path.join(dirName, gid), {recursive: true});
  }
  const data = JSON.stringify(user);
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      return callback(err);
    }
    return callback(null, user);
  });
};

store.get = function(key, callback) {
  callback = callback || function() {};

  if (key === null) {
    fs.readdir(path.join(dirName, 'local'), (err, files) => {
      if (err) {
        return callback(err);
      }
      return callback(
          null,
          files.map((file) => file.replace(/_/g, '.')),
      );
    });
  } else if (typeof key === 'object' && key.key !== null) {
    const filePath = getFilePath(key.gid, key.key);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {recursive: true});
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(new Error('File/key does not exist'));
      }
      return callback(null, JSON.parse(data));
    });
  } else if (typeof key === 'object' && key.key === null) {
    const p = path.join(dirName, key.gid);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, {recursive: true});
    }
    fs.readdir(p, (err, files) => {
      if (err) {
        return callback(err);
      }
      return callback(
          null,
          files.map((file) => file.replace(/_/g, '.')),
      );
    });
  } else {
    const filePath = getFilePath('local', key);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {recursive: true});
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(new Error('File/key does not exist'));
      }
      return callback(null, JSON.parse(data));
    });
  }
};

store.del = function(key, callback) {
  callback = callback || function() {};
  let filePath;
  if (typeof key === 'object' && key.key !== null) {
    filePath = getFilePath(key.gid, key.key);
  } else {
    filePath = getFilePath('local', key);
  }
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
