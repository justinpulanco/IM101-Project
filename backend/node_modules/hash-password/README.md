# hash-password

A tiny library to hash and salt passwords.

## Usage
~~~
// make a generator passing options is optional
const pw = password({
  algorithm: 'sha512',
  encoding: 'hex',
  saltLength: 16
});

// create a password hash object from a raw text password
const hashed = pw.generate('aaa');
console.log(hashed); // -> { hash: abcdefghijklmnopqusrtuvwxyz1234567890, salt: 1234567890123456 }

// check if raw text password matches hashed password
console.log(pw.validate('aaa', hashed)); // -> true
console.log(pw.validate('bbb', hashed)); // -> false
~~~