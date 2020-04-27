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

function configureApplicationArchitects({
  name,
  pathPrefix,
}) {
  execSync(`ng config projects["${name}-e2e"].root ${pathPrefix}${name}-e2e`);
  execSync(`ng config projects["${name}-e2e"].architect.lint.options.tsConfig `
    + `${pathPrefix}${name}-e2e/tsconfig.json`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}'].architect.e2e"`);
  execSync(`npx json -I -f angular.json -e `
    + `"this.projects['${name}'].architect.lint.options.tsConfig.pop()"`);
  execSync(`ng config projects["${name}"].architect.lint.options.exclude[1] `
    + `!${pathPrefix}${name}/**`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.build"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect['extract-i18n']"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.serve"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.test"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].prefix"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].sourceRoot"`);
  execSync(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].schematics"`);
  execSync(
    `ng config projects["${name}-e2e"].architect.lint.options.exclude[1] `
    + `!${pathPrefix}${name}-e2e/**`);
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

function configureLibraryArchitect({
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

function extractEndToEndTestingProject({
  name,
  pathPrefix,
}) {
  moveDirectory({
    from: `${pathPrefix}${name}/e2e`,
    to: `${pathPrefix}${name}-e2e`,
  });
  execSync(`npx json -I -f ${pathPrefix}${name}-e2e/tsconfig.json -e `
    + `"this.extends = '../../../tsconfig.json'"`);
  execSync(`npx json -I -f ${pathPrefix}${name}-e2e/tsconfig.json -e `
    + `"this.compilerOptions.outDir = '../../../out-tsc/e2e'"`);
  execSync(
    `ng config projects["${name}"].architect.e2e.options.protractorConfig `
    + `${pathPrefix}${name}-e2e/protractor.conf.js`);
  execSync(`npx json -I -f angular.json -e `
    + `"this.projects['${name}-e2e'] = this.projects['${name}']"`);
}

function generateApplication({
  groupingFolder,
  name,
  scope,
}) {
  const pathPrefix = ['apps', groupingFolder].join('/') + '/'

  generateApplicationProject({
    name,
    pathPrefix,
    scope,
  });
  extractEndToEndTestingProject({
    name,
    pathPrefix,
  });
  configureApplicationArchitects({
    name,
    pathPrefix,
  });
}

function generateApplicationProject({
  name,
  pathPrefix,
  scope,
}) {
  execSync(`ng generate application ${name} --prefix=${scope} `
    + `--project-root=${pathPrefix}${name} --style=css --routing=false`);
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
  configureLibraryArchitect({ name, scope });
  cleanUpLibraryProjectFiles({ name, scope });
  generateLibraryFiles({ name, scope, type });
  configurePathMapping({ name, npmScope, scope });
  configureKarmaConfig({ name, scope });
}

function moveDirectory({
  from,
  to,
}) {
  execSync(`npx copy ${from}/**/* ${to}`);
  execSync(`npx rimraf ${from}`)
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
    'ERROR: Must be run from the workspace root folder that contains '
    + 'angular.json.');

  process.exit(1);
}

const defaultScope = 'shared';
const argv = yargs
  .scriptName('generate-project')
  .usage('Usage: $0 <command> <args>')
  .command({
    command: 'application <name>',
    description: 'Generate application',
    aliases: ['app'],
    builder: yargs => {
      yargs.positional('name', {
        description: 'Application name, for example "booking-desktop" or '
          + '"check-in-mobile"',
        type: 'string',
      });
      yargs.option('grouping-folder', {
        default: '',
        description: 'Name of application grouping folder, for example '
          + '"booking" or "check-in"',
        type: 'string',
      });
    },
    handler: _argv => {
      setImmediate(() => {
        if (scope === 'shared') {
          console.error(
            'ERROR: "scope" parameter cannot be "shared" for application '
            + 'projects');

          process.exit(1);
        }

        generateApplication({
          groupingFolder,
          name,
          scope,
        });
      });
    },
  })
  .command({
    command: 'library <type> [name]',
    description: 'Generate workspace library',
    aliases: ['lib'],
    builder: yargs => {
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
    handler: _argv => {
      setImmediate(() => {
        generateWorkspaceLibrary({
          name,
          npmScope,
          scope,
          type,
        });
      });
    },
  })
  .option('scope', {
    alias: 's',
    default: defaultScope,
    description:
      'Project scope, for example "shared", "booking", or "check-in"',
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
const { groupingFolder, npmScope, scope, type, name = type } = argv;
