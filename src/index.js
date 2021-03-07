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

"use strict";

(() => {
  const setup = require("./setup");
  const main = require("./main");
  const { logGreen, logRed } = require("./log");

  setup().then(async config => {
    if (config.success) {
      await main(config);
    }
  }).catch(async e => {
    if (e !== undefined) {
      logRed("There was an unhandled error while running DifferentChat. Please report this issue:\n");
      console.error(e);
    }
  }).finally(async () => {
    logGreen("\n\nThanks for using DifferentChat. Press any key to exit...");
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", process.exit.bind(process, 0));
  });

})();