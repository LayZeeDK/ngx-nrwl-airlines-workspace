const childProcess = require('child_process');
const fs = require('fs');
const yargs = require('yargs');

function cleanUpDefaultLibraryFiles({ name, scope }) {
  execSync(`npx rimraf libs/${scope}/${name}/*package.json`);
  execSync(`npx rimraf libs/${scope}/${name}/tsconfig.lib.prod.json`);
  execSync(`npx rimraf libs/${scope}/${name}/src/lib/*.*`);
}

function configureApplicationArchitects({ name, pathPrefix }) {
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

function configureKarmaConfig({ name, groupingFolder, projectRoot, scope }) {
  if (scope === groupingFolder) {
    groupingFolder = '';
  }

  const pathSuffix = [projectRoot, scope, groupingFolder, name].join('/')
  const karmaConfig = `const path = require('path');

const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = (config) => {
  const baseConfig = getBaseKarmaConfig();
  config.set({
    ...baseConfig,
    coverageIstanbulReporter: {
      ...baseConfig.coverageIstanbulReporter,
      dir: path.join(__dirname, '../../../coverage/${pathSuffix}'),
    },
  });
};
`;
  fs.writeFileSync(`${cwd}/${pathSuffix}/karma.conf.js`, karmaConfig);
}

function configureLibraryArchitect({ name, scope }) {
  execSync('npx json -I -f angular.json '
    + `-e "delete this.projects['${scope}-${name}'].architect.build"`);
  execSync(
    `ng config projects["${scope}-${name}"].architect.lint.options.exclude[1] `
    + `!libs/${scope}/${name}/**`);
  execSync(`npx json -I -f libs/${scope}/${name}/tslint.json `
    + `-e "this.linterOptions = { exclude: ['!**/*'] }"`);
}

function configurePathMapping({ name, npmScope, scope }) {
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

function extractEndToEndTestingProject({ name, pathPrefix }) {
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

function generateApplication({ groupingFolder, name, scope }) {
  const pathPrefix = ['apps', groupingFolder].join('/') + '/'

  generateApplicationProject({ name, pathPrefix, scope });
  extractEndToEndTestingProject({ name, pathPrefix });
  configureApplicationArchitects({ name, pathPrefix });
  configureKarmaConfig({ groupingFolder, name, projectRoot: 'apps', scope });
}

function generateApplicationProject({ name, pathPrefix, scope }) {
  execSync(`ng generate application ${name} --prefix=${scope} `
    + `--project-root=${pathPrefix}${name} --style=css --routing=false`);
}

function generateFeatureState({
  name,
  scope,
}) {
  execSync(
    `ng generate @ngrx/schematics:feature +state/${scope} `
    + `--project=${scope}-${name} --module=${scope}-${name}.module.ts `
    + '--creators=true --api=false');
}

function generateLibraryAngularModule({ isPresentationLayer, name, scope }) {
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
}

function generateLibraryComponent({ name, scope }) {
  const isFeatureShell = name.endsWith('feature-shell');
  const componentName = isFeatureShell ? 'shell' : name.replace(/^.*?-/, '');

  execSync(`ng generate component ${componentName} `
    + `--project=${scope}-${name} --module=${scope}-${name}.module.ts `
    + `--display-block`);

  if (!isFeatureShell) {
    return;
  }

  const shellComponentTemplate = '<router-outlet></router-outlet>';

  fs.writeFileSync(
    `${cwd}/libs/${scope}/${name}/src/lib/${componentName}/${componentName}.component.html`,
    shellComponentTemplate);

  const shellComponentClassName = toPascalCase(`${componentName}-component`);
  const featureShellModuleClassName = toPascalCase(`${scope}-${name}-module`);
  const featureShellModule = `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ${shellComponentClassName} } from './${componentName}/${componentName}.component';

const routes: Routes = [
  {
    path: '',
    component: ${shellComponentClassName},
    children: [],
  },
];

@NgModule({
  declarations: [${shellComponentClassName}],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes),
  ],
})
export class ${featureShellModuleClassName} {}
`;

  fs.writeFileSync(
    `${cwd}/libs/${scope}/${name}/src/lib/${scope}-${name}.module.ts`,
    featureShellModule);
}

function generateLibraryProject({ name, npmScope, scope }) {
  const prefix =
    (scope === defaultScope)
      ? npmScope
      : scope;

  execSync(`ng config newProjectRoot libs/${scope}`);
  execSync(`ng generate library ${name} --prefix=${prefix} `
    + '--entry-file=index --skip-install --skip-package-json');
}

function generateLibraryPublicApi({ name, scope }) {
  const publicApi = `/*
* Public API Surface of ${scope}-${name}
*/

export * from './lib/${scope}-${name}.module';
`;

  fs.writeFileSync(`${cwd}/libs/${scope}/${name}/src/index.ts`, publicApi);
}

function generateWorkspaceLibrary({ groupingFolder, name, npmScope, scope, type }) {
  const isDataAccess = type === 'data-access';
  const isPresentationLayer = ['feature', 'ui'].includes(type);

  generateLibraryProject({ name, npmScope, scope });
  renameLibraryProject({ name, scope });
  configureLibraryArchitect({ name, scope });
  cleanUpDefaultLibraryFiles({ name, scope });
  generateLibraryAngularModule({
    isPresentationLayer,
    name,
    scope,
  });

  if (isPresentationLayer) {
    generateLibraryComponent({ name, scope });
  }

  if (isDataAccess && withState) {
    generateFeatureState({ name, scope });
  }

  generateLibraryPublicApi({ name, scope });
  configurePathMapping({ name, npmScope, scope });
  configureKarmaConfig({ groupingFolder, name, projectRoot: 'libs', scope });
}

function moveDirectory({ from, to }) {
  execSync(`npx copy ${from}/**/* ${to}`);
  execSync(`npx rimraf ${from}`)
}

function renameLibraryProject({ name, scope }) {
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
    aliases: ['app', 'a'],
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

        generateApplication({ groupingFolder, name, scope });
      });
    },
  })
  .command({
    command: 'library <type> [name]',
    description: 'Generate workspace library',
    aliases: ['lib', 'l'],
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
      yargs.option('grouping-folder', {
        default: '',
        description: 'Name of library grouping folder, for example "seatmap"',
        type: 'string',
      });
      yargs.option('with-state', {
        default: false,
        description: 'Whether to include NgRx +state folder',
        type: 'boolean',
      });
    },
    handler: _argv => {
      setImmediate(() => {
        generateWorkspaceLibrary({
          groupingFolder,
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
const { groupingFolder, npmScope, scope, type, withState, name = type } = argv;
