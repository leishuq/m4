const assert = require('assert');
var crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

// The NID is the SHA256 hash of the JSON representation of the node
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

// The SID is the first 5 characters of the NID
function getSID(node) {
  return getNID(node).substring(0, 5);
}

function idToNum(id) {
  let n = parseInt(id, 16);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
}

function consistentHash(kid, nids) {
  const KID = idToNum(kid);
  const nidsArr = nids.map((nid) => ({
    id: nid,
    hash: idToNum(nid),
  }));
  nidsArr.sort((a, b) => a.hash - b.hash);
  for (const nid in nidsArr) {
    if (nid >= KID) {
      return nid.id;
    }
  }
  return nidsArr[0].id;
}

function rendezvousHash(kid, nids) {
  const nidsArr = nids.map((nid) => ({
    id: nid,
    hash: getID(kid + nid),
  }));
  nidsArr.sort((a, b) => idToNum(a.hash) - idToNum(b.hash));
  return nidsArr[nidsArr.length - 1].id;
}

module.exports = {
  getNID: getNID,
  getSID: getSID,
  getID: getID,
  idToNum: idToNum,
  naiveHash: naiveHash,
  consistentHash: consistentHash,
  rendezvousHash: rendezvousHash,
};
