import makeSalt from './makeSalt';
import makeHash from './makeHash';

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

export default password;
