import fs from 'fs';

/**
 * @param {fs.PathLike} dir
 * @param {string[]} paths
 */
export default function readdir(dir, paths = []) {
  fs.readdirSync(dir).forEach((relativePath) => {
    const path = `${dir}/${relativePath}`;

    if (fs.statSync(path).isDirectory()) {
      readdir(path, paths);
    } else {
      paths.push(path);
    }
  });

  return paths;
}
