export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'scope-enum': [2, 'always', ['ui', 'worker', 'hooks', 'lib', 'deps', 'ci', 'docs']],
  },
};
