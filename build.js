/*
 * This file is part of DifferentChat.
 *
 * DifferentChat is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DifferentChat is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with DifferentChat.  If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require("fs");
const path = require("path");

const pkg = require("pkg");

(async () => {
  const dir = path.join(__dirname, "./build");

  await fs.promises.mkdir(dir).catch(() => {});

  let files = await fs.promises.readdir(dir);
  await Promise.all(files.map(file => fs.promises.unlink(path.join(dir, file))));

  await pkg.exec(["src/index.js", "--targets", "linux,win,macos", "--out-path", "build"]);

  files = await fs.promises.readdir(dir);
  await Promise.all(files.map(file => {
    return fs.promises.rename(path.join(dir, file), path.join(dir, file.replace("index", "DifferentChat")));
  }));
})();