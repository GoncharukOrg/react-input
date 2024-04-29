import { execSync } from 'child_process';

import pckg from '../package.json';

const deps = Object.entries(pckg.devDependencies).map(([key]) => `${key}@latest`);
const command = `npm i -D ${deps.join(' ')}`;

console.log(command);
execSync(command);
