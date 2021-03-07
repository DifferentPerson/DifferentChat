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

const padString = num => num.toString().padStart(2, "0");

const getDateString = () => {
  const date = new Date();
  return date.getFullYear().toString() + "-"
    + padString(date.getMonth() + 1) + "-"
    + padString(date.getDate()) + "-"
    + padString(date.getHours());
};

const getLogTimestamp = () => {
  const date = new Date();
  return `${padString(date.getHours())}:${padString(date.getMinutes())}:${padString(date.getSeconds())}`;
};

const keyPress = async () => {
  process.stdin.setRawMode(true);
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve();
  }));
};

module.exports = {
  getDateString,
  keyPress,
  getLogTimestamp
};