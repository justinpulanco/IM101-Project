'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));

const makeSalt = (length) => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

const makeHash = (password, salt, algorithm, encoding) => {
  const hash = crypto.createHmac(algorithm, salt);
  hash.update(password);
  return hash.digest(encoding);
};

const defaults = {
  algorithm: 'sha512',
  encoding: 'hex',
  saltLength: 16
};

const password = (options = {}) => {
  const algorithm = options.algorithm || defaults.algorithm;
  const encoding = options.encoding || defaults.encoding;
  const saltLength = options.saltLength || defaults.saltLength;

  const generator = {};

  generator.generate = (pw) => {
    const salt = makeSalt(saltLength);
    return { hash: makeHash(pw, salt, algorithm, encoding), salt };
  };

  generator.validate = (
    pw, { hash, salt }
  ) => makeHash(pw, salt, algorithm, encoding) === hash;

  return generator;
};

module.exports = password;
