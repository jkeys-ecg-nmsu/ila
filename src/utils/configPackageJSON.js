const report = require('yurnalist');
const fs = require('fs').promises;

module.exports = async () => {
  const spinner = report.activity();
  spinner.tick('Configuring package.json');

  // get current package.json
  const packageJSON = await fs
    .readFile('./package.json')
    .then((data) => JSON.parse(data.toString()));

  // add overrides
  const packageJSONConfigured = {
    ...packageJSON,
    scripts: {
      start: 'lambda-local -l ./src/index.js -h handler -e ./event.js',
      test: 'jest --watchAll',
      coverage: 'jest --coverage',
      'test:ci': 'jest --watchAll=false',
      prettier: 'prettier --write .',
    },
    husky: {
      hooks: {
        'pre-commit': 'npm run test:ci && lint-staged',
        'pre-push': 'npm run coverage',
      },
    },
    'lint-staged': {
      '*.js': 'eslint --cache --fix',
    },
  };

  // write new file
  await fs.writeFile('package.json', JSON.stringify(packageJSONConfigured));

  spinner.end();
  report.success('package.json configured');
};
