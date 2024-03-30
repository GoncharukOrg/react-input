/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import style from '../utils/style';

const packageName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;

console.log(
  `${style.fg.yellow}The package ${style.fg.blue}${packageName} ${style.fg.yellow}was successfully built!`,
  style.reset,
);
