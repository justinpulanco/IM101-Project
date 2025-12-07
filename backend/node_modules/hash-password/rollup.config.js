import autoExternal from 'rollup-plugin-auto-external';

module.exports = [{
  input: './src/index.js',
  output: {
    file: 'dist/hash-password.js',
    format: 'cjs'
  },
  plugins: [autoExternal()]
}];
