import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

import corePackage from '../packages/core/package.json';
import style from '../utils/style';

const { npm_package_json, npm_package_name, npm_package_version } = process.env;

if (!npm_package_json || !npm_package_name || !npm_package_version) {
  throw new Error('');
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(`Do you want to update and publish the ${npm_package_name} package? `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    rl.close();
    process.exit();
  }

  if (npm_package_name !== '@react-input/core') {
    fs.writeFileSync(
      npm_package_json,
      fs
        .readFileSync(npm_package_json, 'utf8')
        .replace(/"@react-input\/core": "\^\d+\.\d+\.\d+"/, `"@react-input/core": "^${corePackage.version}"`),
    );
  }
  execSync('npm run build');
  const output = execSync(`npm version ${process.argv[2]}`, { encoding: 'utf8' });

  const packageName = npm_package_name.replace(/^.+\/(.+)/, '$1');
  const newPackageVersion = /\d+\.\d+\.\d+/.exec(output)?.[0];

  if (!newPackageVersion) {
    throw new Error('');
  }

  const commit = `${packageName}/v${newPackageVersion}`;

  execSync('npm publish');
  execSync(`git add ../../ && git commit -m "${commit}" && git push && git tag ${commit} && git push origin --tags`);

  console.log(
    `${style.fg.yellow}The version of the package ${style.fg.blue}${npm_package_name} ${style.fg.yellow}has been updated!`,
    style.reset,
    `\n${npm_package_version} → ${newPackageVersion}\n`,
  );

  rl.close();
});
