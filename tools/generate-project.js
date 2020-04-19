const childProcess = require('child_process');
const fs = require('fs');
const yargs = require('yargs');

function cleanUpLibraryProjectFiles({
  name,
  scope,
}) {
  execSync(`npx rimraf libs/${scope}/${name}/*package.json`);
  execSync(`npx rimraf libs/${scope}/${name}/tsconfig.lib.prod.json`);
  execSync(`npx rimraf libs/${scope}/${name}/src/lib/*.*`);
}

function configureArchitects({
  name,
  scope,
}) {
  execSync('npx json -I -f angular.json '
    + `-e "delete this.projects['${scope}-${name}'].architect.build"`);
  execSync(
    `ng config projects["${scope}-${name}"].architect.lint.options.exclude[1] `
    + `!libs/${scope}/${name}/**`);
  execSync(`npx json -I -f libs/${scope}/${name}/tslint.json `
    + `-e "this.linterOptions = { exclude: ['!**/*'] }"`);
}

function configureKarmaConfig({
  name,
  scope,
}) {
  const karmaConfig = `const path = require('path');

const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = (config) => {
  const baseConfig = getBaseKarmaConfig();
  config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
      ...baseConfig.coverageIstanbulReporter,
      dir: path.join(__dirname, '../../../coverage/libs/${scope}/${name}'),
    },
  });
};
`;
  fs.writeFileSync(`${cwd}/libs/${scope}/${name}/karma.conf.js`, karmaConfig);
}

function configurePathMapping({
  name,
  npmScope,
  scope,
}) {
  execSync(`npx json -I -f tsconfig.json -e `
    + `"delete this.compilerOptions.paths['${name}']"`);
  execSync(`npx json -I -f tsconfig.json `
    + `-e "this.compilerOptions.paths['@${npmScope}/${scope}/${name}'] = `
    + `['libs/${scope}/${name}/src/index.ts']"`);
}

function execSync(command) {
  return childProcess.execSync(command, {
    stdio: 'inherit',
  });
}

function generateLibraryFiles({
  name,
  scope,
  type,
}) {
  const isPresentationLayer = ['feature', 'ui'].includes(type);

  execSync(`ng generate module ${scope}-${name} --project=${scope}-${name} `
    + `--flat ${isPresentationLayer ? '' : '--no-common-module'}`);
  const moduleName = toPascalCase(`${scope}-${name}-module`);
  const moduleSpec = `import { TestBed } from '@angular/core/testing';

import { ${moduleName} } from './${scope}-${name}.module';

describe('${moduleName}', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [${moduleName}],
    });
    await TestBed.compileComponents();
  });

  it('should create', () => {
    expect(${moduleName}).toBeDefined();
  });
});
`;
  fs.writeFileSync(
    `${cwd}/libs/${scope}/${name}/src/lib/${scope}-${name}.module.spec.ts`,
    moduleSpec);

  const isFeatureShell = name.endsWith('feature-shell');

  if (isPresentationLayer && !isFeatureShell) {
    execSync(`ng generate component ${name.replace(/^.*?-/, '')} `
      + `--project=${scope}-${name} --module=${scope}-${name}.module.ts `
      + `--display-block`);
  }

  const publicApi = `/*
* Public API Surface of ${scope}-${name}
*/

export * from './lib/${scope}-${name}.module';
`;

  fs.writeFileSync(`${cwd}/libs/${scope}/${name}/src/index.ts`, publicApi);
}

function generateLibraryProject({
  name,
  npmScope,
  scope,
}) {
  const prefix =
    (scope === defaultScope)
      ? npmScope
      : scope;

  execSync(`ng config newProjectRoot libs/${scope}`);
  execSync(`ng generate library ${name} --prefix=${prefix} `
    + '--entry-file=index --skip-install --skip-package-json');
}

function generateWorkspaceLibrary({
  name,
  npmScope,
  scope,
  type,
}) {
  generateLibraryProject({ name, npmScope, scope });
  renameLibraryProject({ name, scope });
  configureArchitects({ name, scope });
  cleanUpLibraryProjectFiles({ name, scope });
  generateLibraryFiles({ name, scope, type });
  configurePathMapping({ name, npmScope, scope });
  configureKarmaConfig({ name, scope });
}

function renameLibraryProject({
  name,
  scope,
}) {
  execSync('npx json -I -f angular.json '
    + `-e "this.projects['${scope}-${name}'] = this.projects['${name}']"`);
  execSync(`npx json -I -f angular.json -e "delete this.projects['${name}']"`);
}

function toPascalCase(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const cwd = process.cwd();

if (!fs.existsSync(`${cwd}/angular.json`)) {
  console.error(
    'ERROR: Must be run from the workspace root folder that contains angular.json.');

  process.exit(1);
}

const defaultScope = 'shared';
const argv = yargs
  .scriptName('generate-project')
  .usage('Usage: $0 <command> <args>')
  .command(
    'library <type> [name]', 'Generate workspace library',
    yargs => {
      yargs.positional('type', {
        description:
          'The library type, for example "data-access", "feature", or "ui"',
        type: 'string',
      });
      yargs.positional('name', {
        description: 'Library name, for example "feature-shell"',
        type: 'string',
      });
    },
    _argv => {
      setImmediate(() => {
        generateWorkspaceLibrary({
          name,
          npmScope,
          scope,
          type,
        });
      });
    })
  .option('scope', {
    alias: 's',
    default: defaultScope,
    description:
      'Library scope, for example "shared", "booking", or "check-in"',
    type: 'string',
  })
  .option('npm-scope', {
    alias: 'p',
    default: 'workspace',
    description: 'Workspace path mapping scope, for example "workspace", '
      + 'or "nrwl-airlines"',
    type: 'string',
  })
  .demandCommand()
  .help().alias('help', 'h')
  .version('1.0.0').alias('version', 'v')
  .argv;
const { npmScope, scope, type, name = type } = argv;
