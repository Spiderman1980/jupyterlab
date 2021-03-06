/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

/**
 * Remove an extension from the relevant metadata
 * files of the JupyterLab source tree so that it
 * is not included in the build. Intended for testing
 * adding/removing extensions against development
 * branches of JupyterLab.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as utils from './utils';

// Make sure we have required command line arguments.
if (process.argv.length < 3) {
  let msg = '** Must supply a target extension name';
  process.stderr.write(msg);
  process.exit(1);
}

// Get the package name or path.
let target = process.argv[2];
let basePath = path.resolve('.');

// Get the package.json of the extension.
let packagePath = path.join(basePath, 'packages', target, 'package.json');
if (!fs.existsSync(packagePath)) {
  packagePath = require.resolve(path.join(target, 'package.json'));
}

// Remove the package from the local tree.
fs.removeSync(path.dirname(packagePath));

// Update the core jupyterlab build dependencies.
utils.run('npm run integrity');
