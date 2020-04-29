const childProcess = require('child_process');
const fs = require('fs');
const yargs = require('yargs');

function addScopeToLibraryProjectName({ name, scope }) {
  runCommand('npx json -I -f angular.json '
    + `-e "this.projects['${scope}-${name}'] = this.projects['${name}']"`);
  runCommand(`npx json -I -f angular.json -e "delete this.projects['${name}']"`);
}

function appComponentWithFeatureShellTemplate() {
  return `<h1>
  {{title}}
</h1>

<router-outlet></router-outlet>
`;
}

function appFolderPath({ groupingFolder, name }) {
  return ['apps', groupingFolder, name, 'src', 'app']
    .filter(x => !!x)
    .join('/');
}

function cleanUpDefaultLibraryFiles({ name, scope }) {
  runCommand(`npx rimraf libs/${scope}/${name}/*package.json`);
  runCommand(`npx rimraf libs/${scope}/${name}/tsconfig.lib.prod.json`);
  runCommand(`npx rimraf libs/${scope}/${name}/src/lib/*.*`);
}

function configureApplicationArchitects({ name, pathPrefix }) {
  runCommand(`ng config projects["${name}-e2e"].root ${pathPrefix}${name}-e2e`);
  runCommand(`ng config projects["${name}-e2e"].architect.lint.options.tsConfig `
    + `${pathPrefix}${name}-e2e/tsconfig.json`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}'].architect.e2e"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"this.projects['${name}'].architect.lint.options.tsConfig.pop()"`);
  runCommand(`ng config projects["${name}"].architect.lint.options.exclude[1] `
    + `!${pathPrefix}${name}/**`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.build"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect['extract-i18n']"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.serve"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].architect.test"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].prefix"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].sourceRoot"`);
  runCommand(`npx json -I -f angular.json -e `
    + `"delete this.projects['${name}-e2e'].schematics"`);
  runCommand(
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
  writeFile(`${pathSuffix}/karma.conf.js`, karmaConfig);
}

function configureLibraryArchitect({ name, scope }) {
  runCommand('npx json -I -f angular.json '
    + `-e "delete this.projects['${scope}-${name}'].architect.build"`);
  runCommand(
    `ng config projects["${scope}-${name}"].architect.lint.options.exclude[1] `
    + `!libs/${scope}/${name}/**`);
  runCommand(`npx json -I -f libs/${scope}/${name}/tslint.json `
    + `-e "this.linterOptions = { exclude: ['!**/*'] }"`);
}

function configurePathMapping({ name, npmScope, scope }) {
  runCommand(`npx json -I -f tsconfig.json -e `
    + `"delete this.compilerOptions.paths['${name}']"`);
  runCommand(`npx json -I -f tsconfig.json `
    + `-e "this.compilerOptions.paths['@${npmScope}/${scope}/${name}'] = `
    + `['libs/${scope}/${name}/src/index.ts']"`);
}

function extractEndToEndTestingProject({ name, pathPrefix }) {
  moveDirectory({
    from: `${pathPrefix}${name}/e2e`,
    to: `${pathPrefix}${name}-e2e`,
  });
  runCommand(`npx json -I -f ${pathPrefix}${name}-e2e/tsconfig.json -e `
    + `"this.extends = '../../../tsconfig.json'"`);
  runCommand(`npx json -I -f ${pathPrefix}${name}-e2e/tsconfig.json -e `
    + `"this.compilerOptions.outDir = '../../../out-tsc/e2e'"`);
  runCommand(
    `ng config projects["${name}"].architect.e2e.options.protractorConfig `
    + `${pathPrefix}${name}-e2e/protractor.conf.js`);
  runCommand(`npx json -I -f angular.json -e `
    + `"this.projects['${name}-e2e'] = this.projects['${name}']"`);
}

function importRouterModuleInAppComponentSpec({ groupingFolder, name }) {
  const filePath =
    `${appFolderPath({ groupingFolder, name })}/app.component.spec.ts`;

  const importsSearch = /declarations:\s*\[\s*AppComponent\s*\],/;
  const importsReplacement = `declarations: [AppComponent],
      imports: [
        RouterModule.forRoot([]),
      ],`

  searchAndReplaceInFile({
    filePath,
    replacement: importsReplacement,
    search: importsSearch,
  });

  const componentImportSearch = "import { AppComponent } from './app.component';";
  const componentImportReplacement = `import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';`;

  searchAndReplaceInFile({
    filePath,
    replacement: componentImportReplacement,
    search: componentImportSearch,
  });
}

function featureShellModule({ componentName, name, scope }) {
  const featureShellModuleClassName = toPascalCase(`${scope}-${name}-module`);

  return `import { NgModule } from '@angular/core';
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
}

function generateApplication({ groupingFolder, name, npmScope, scope }) {
  const projectRoot = 'apps';
  const pathPrefix = [projectRoot, groupingFolder].join('/') + '/'

  generateApplicationProject({ name, pathPrefix, scope });

  if (hasSharedEnvironmentsLibary({ scope })) {
    const sharedEnvironmentsLibraryName =
      readMaybeSharedEnvironmentsLibraryName({ scope });

    useSharedEnvironmentsLibraryInMainFile({
      groupingFolder,
      name,
      npmScope,
      projectRoot,
      sharedEnvironmentsLibraryName,
    });
  }

  if (hasFeatureShellLibrary({ scope })) {
    useFeatureShell({ groupingFolder, name, scope });
  }

  extractEndToEndTestingProject({ name, pathPrefix });
  configureApplicationArchitects({ name, pathPrefix });
  configureKarmaConfig({ groupingFolder, name, projectRoot, scope });
}

function generateApplicationProject({ name, pathPrefix, scope }) {
  runCommand(`ng generate application ${name} --prefix=${scope} `
    + `--project-root=${pathPrefix}${name} --style=css --routing=false`);
}

function generateFeatureState({ name, scope }) {
  runCommand(
    `ng generate @ngrx/schematics:feature +state/${scope} `
    + `--project=${scope}-${name} --module=${scope}-${name}.module.ts `
    + '--creators=true --api=false');
}

function generateLibraryAngularModule({ isPresentationLayer, name, scope }) {
  runCommand(`ng generate module ${scope}-${name} --project=${scope}-${name} `
    + `--flat ${isPresentationLayer ? '' : '--no-common-module'}`);

  writeFile(
    `libs/${scope}/${name}/src/lib/${scope}-${name}.module.spec.ts`,
    libraryModuleSpec({ name, scope }));
}

function generateLibraryComponent({ name, scope }) {
  const isFeatureShell = name.endsWith('feature-shell');
  const componentName = isFeatureShell ? 'shell' : name.replace(/^.*?-/, '');

  runCommand(`ng generate component ${componentName} `
    + `--project=${scope}-${name} --module=${scope}-${name}.module.ts `
    + `--display-block`);

  if (!isFeatureShell) {
    return;
  }

  writeFile(
    `libs/${scope}/${name}/src/lib/${componentName}/${componentName}.component.html`,
    shellComponentTemplate());
  writeFile(
    `libs/${scope}/${name}/src/lib/${componentName}/${componentName}.component.spec.ts`,
    shellComponentSpec({ componentName }));
  writeFile(
    `libs/${scope}/${name}/src/lib/${scope}-${name}.module.ts`,
    featureShellModule({ componentName, name, scope }));
}

function generateLibraryProject({ name, npmScope, scope }) {
  const prefix =
    (scope === defaultScope)
      ? npmScope
      : scope;

  runCommand(`ng config newProjectRoot libs/${scope}`);
  runCommand(`ng generate library ${name} --prefix=${prefix} `
    + '--entry-file=index --skip-install --skip-package-json');
}

function generateLibraryPublicApi({ name, scope }) {
  writeFile(
    `libs/${scope}/${name}/src/index.ts`,
    libraryPublicApi({ name, scope }));
}

function generateWorkspaceLibrary({ groupingFolder, name, npmScope, scope, type }) {
  const isDataAccess = type === 'data-access';
  const isPresentationLayer = ['feature', 'ui'].includes(type);

  generateLibraryProject({ name, npmScope, scope });
  addScopeToLibraryProjectName({ name, scope });
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

function hasFeatureShellLibrary({ scope }) {
  return Object.keys(readAngularJson().projects).find(projectName =>
    projectName === `${scope}-feature-shell`)
    !== undefined;
}

function hasSharedEnvironmentsLibary({ scope }) {
  return readMaybeSharedEnvironmentsLibraryName({ scope }) !== undefined;
}

function libraryImportPath({ groupingFolder, npmScope, scope, name }) {
  return [`@${npmScope}`, scope, groupingFolder, name]
    .filter(x => !!x)
    .join('/');
}

function libraryModuleSpec({ name, scope }) {
  const moduleName = toPascalCase(`${scope}-${name}-module`);

  return `import { TestBed } from '@angular/core/testing';

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
}

function libraryPublicApi({ name, scope }) {
  return `/*
* Public API Surface of ${scope}-${name}
*/

export * from './lib/${scope}-${name}.module';
`;
}

function moveDirectory({ from, to }) {
  runCommand(`npx copy ${from}/**/* ${to}`);
  runCommand(`npx rimraf ${from}`)
}

function readAngularJson() {
  return JSON.parse(readFile('angular.json'));
}

function readFile(filePath) {
  return fs.readFileSync(`${cwd}/${filePath}`, { encoding: 'utf8' });
}

function readMaybeSharedEnvironmentsLibraryName({ scope }) {
  const scopedSharedEnvironmentsLibraryName = `${scope}-shared-environments`;

  return Object.keys(readAngularJson().projects)
    .find(projectName => [
      'shared-environments',
      scopedSharedEnvironmentsLibraryName,
    ].includes(projectName));
}

function runCommand(command) {
  return childProcess.execSync(command, { stdio: 'inherit' });
}

function searchAndReplaceInFile({ filePath, search, replacement }) {
  const fileContent = readFile(filePath);

  writeFile(filePath, fileContent.replace(search, replacement));
}

function setAppComponentTemplateToTitleAndRouterOutlet({ groupingFolder, name }) {
  writeFile(
    `${appFolderPath({ groupingFolder, name })}/app.component.html`,
    appComponentWithFeatureShellTemplate());
}

function shellComponentSpec({ componentName }) {
  const shellComponentClassName = toPascalCase(`${componentName}-component`);

  return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { ${shellComponentClassName} } from './${componentName}.component';

describe('${shellComponentClassName}', () => {
  let component: ${shellComponentClassName};
  let fixture: ComponentFixture<${shellComponentClassName}>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [${shellComponentClassName}],
      imports: [
        RouterModule.forRoot([]),
      ],
    });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(${shellComponentClassName});
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`;
}

function shellComponentTemplate() {
  return '<router-outlet></router-outlet>';
}

function toPascalCase(kebabCase) {
  return kebabCase
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function importFeatureShellModuleInAppModule({ groupingFolder, name, scope }) {
  const filePath = `${appFolderPath({ groupingFolder, name })}/app.module.ts`;

  const importsSearch = `imports: [
    BrowserModule
  ],`;
  const featureShellModuleClassName =
    toPascalCase(`${scope}-feature-shell-module`);
  const importsReplacement = `imports: [
    BrowserModule,
    ${featureShellModuleClassName},
  ],`;

  searchAndReplaceInFile({
    filePath,
    replacement: importsReplacement,
    search: importsSearch,
  });

  const componentImportSearch =
    "import { AppComponent } from './app.component';";
  const featureShellLibraryImportPath = libraryImportPath({
    npmScope,
    scope,
    name: 'feature-shell',
  });
  const componentImportReplacement = `import {
  ${featureShellModuleClassName},
} from '${featureShellLibraryImportPath}';

${componentImportSearch}`;

  searchAndReplaceInFile({
    filePath,
    replacement: componentImportReplacement,
    search: componentImportSearch,
  });
}

function useFeatureShell({ groupingFolder, name, scope }) {
  setAppComponentTemplateToTitleAndRouterOutlet({ groupingFolder, name });
  importFeatureShellModuleInAppModule({ groupingFolder, name, scope });
  importRouterModuleInAppComponentSpec({ groupingFolder, name });
}

function useSharedEnvironmentsLibraryInMainFile({
  groupingFolder,
  name,
  npmScope,
  projectRoot,
  sharedEnvironmentsLibraryName,
}) {
  const filePath =
    [projectRoot, groupingFolder, name, 'src', 'main.ts'].join('/');
  const search = "import { environment } from './environments/environment';";
  const sharedEnvironmentsLibraryRoot = readAngularJson()
    .projects[sharedEnvironmentsLibraryName]
    .root;
  const sharedEnvironmentsLibraryImportPath = `@${npmScope}/`
    + sharedEnvironmentsLibraryRoot.replace(/^libs\//, '');
  const replacement =
    `import { environment } from '${sharedEnvironmentsLibraryImportPath}';`;

  searchAndReplaceInFile({ filePath, search, replacement });
}

function writeFile(filePath, fileContent) {
  fs.writeFileSync(`${cwd}/${filePath}`, fileContent, { encoding: 'utf8' });
}

const cwd = process.cwd();

if (!fs.existsSync(`angular.json`)) {
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
    },
    handler: _argv => {
      setImmediate(() => {
        if (scope === 'shared') {
          console.error(
            'ERROR: "scope" parameter cannot be "shared" for application '
            + 'projects');

          process.exit(1);
        }

        generateApplication({ groupingFolder, name, npmScope, scope });
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
  .option('grouping-folder', {
    alias: 'g',
    default: '',
    description: 'Name of project grouping folder, for example "booking", '
      + '"check-in", or "seatmap"',
    type: 'string',
  })
  .option('npm-scope', {
    alias: 'p',
    default: 'workspace',
    description: 'Workspace path mapping scope, for example "workspace", '
      + 'or "nrwl-airlines"',
    type: 'string',
  })
  .option('scope', {
    alias: 's',
    default: defaultScope,
    description:
      'Project scope, for example "shared", "booking", or "check-in"',
    type: 'string',
  })
  .demandCommand()
  .help().alias('help', 'h')
  .version('1.0.0').alias('version', 'v')
  .argv;
const { groupingFolder, npmScope, scope, type, withState, name = type } = argv;
