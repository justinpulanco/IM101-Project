
import crypto from 'crypto';

const randStr = (length) => crypto.randomBytes(Math.ceil(length / 2))
  .toString('hex').slice(0, length);

const sha512 = (password, salt, algorithm = 'sha512') => {
  const hash = crypto.createHmac(algorithm, salt);
  hash.update(password);
  const value = hash.digest('hex');
  return value;
};
const create = (password, algorithm) => {
  const salt = randStr(16);
  return { hash: sha512(password, salt, algorithm), salt };
};

// eslint-disable-next-line no-shadow
const check = (password, { hash, salt }, algorithm) => sha512(password, salt, algorithm) === hash;

const Password = function Password(password, algorithm) {
  if (typeof password === 'string') {
    try {
      password = JSON.parse(password);
    } catch (e) {
      const hashed = create(password, algorithm);
      this.salt = hashed.salt;
      this.hash = hashed.hash;
    }
  }
  if (typeof password === 'object') {
    this.salt = password.salt;
    this.hash = password.hash;
  }
  if (!this.salt || !this.hash) throw new Error('Unable to parse password');
  this.check = (pw) => check(pw, this, algorithm);
};

Password.check = check;
Password.newHash = create;

export default Password;

const np = new Password('aaa');
console.log(np);
console.log(np.check('bbb'));
const string = JSON.stringify(np);
console.log(new Password(string).check('aaa'));
console.log(string);
console.log(Password.check('aaa', JSON.parse(string)));
