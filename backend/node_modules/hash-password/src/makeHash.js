import crypto from 'crypto';

const makeHash = (password, salt, algorithm, encoding) => {
  const hash = crypto.createHmac(algorithm, salt);
  hash.update(password);
  return hash.digest(encoding);
};

export default makeHash;
