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

const log = console.log;

const redText = str => "\x1b[31m" + str + "\x1b[0m";
const greenText = str => "\x1b[32m" + str + "\x1b[0m";
const magentaText = str => "\x1b[35m" + str + "\x1b[0m";

const logRed = message => log(redText(message));
const logGreen = message => log(greenText(message));
const logMagenta = message => log(magentaText(message));

module.exports = {
  log,
  logRed,
  logGreen,
  logMagenta,
  magentaText,
  greenText,
  redText
};