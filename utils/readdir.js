const fs = require('fs');

/**
 * @param {fs.PathLike} dir
 * @param {string[]} paths
 */
function readdir(dir, paths = []) {
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

module.exports = readdir;
