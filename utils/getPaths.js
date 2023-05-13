const fs = require('fs');

function getPaths(dir, paths = []) {
  fs.readdirSync(dir).forEach((relativePath) => {
    const path = `${dir}/${relativePath}`;

    if (fs.statSync(path).isDirectory()) {
      getPaths(path, paths);
    } else {
      paths.push(path);
    }
  });

  return paths;
}

module.exports = getPaths;
