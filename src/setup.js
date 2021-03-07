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

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const read = promisify(require("read"));

const version = require("./version");
const { log, logMagenta, logGreen, logRed, magentaText, greenText, redText } = require("./log");

const { keyPress } = require("./utils");

const homeDir = require("os").homedir();

class Config {

  static failure = new Config(false);

  success;

  constructor(success) {
    this.success = success;
  }

  server;

  port;

  version;

  messages;

  messageDelay;

  messageCount;

  reconnectDelay;

  reconnectTries;

  email;

  password;

  configDir;

}

const asciiArt = ` ____  _  __  __                     _    ____ _           _   
|  _ \\(_)/ _|/ _| ___ _ __ ___ _ __ | |_ / ___| |__   __ _| |_ 
| | | | | |_| |_ / _ \\ '__/ _ \\ '_ \\| __| |   | '_ \\ / _\` | __|
| |_| | |  _|  _|  __/ | |  __/ | | | |_| |___| | | | (_| | |_ 
|____/|_|_| |_|  \\___|_|  \\___|_| |_|\\__|\\____|_| |_|\\__,_|\\__|`;

const settingsTxt = magentaText("settings.txt");
const messagesTxt = magentaText("messages.txt");
const logsMagenta = magentaText("logs");

async function setup() {

  // friendly message
  logMagenta(`\n${asciiArt}\n`);
  logMagenta(`DifferentChat v${version}\n`);
  logMagenta(`Created by ADifferentPerson#3840. If you have any issues, please join the Discord.\nhttps://discord.gg/[REDACTED]\n`);

  const folderPath = path.join(homeDir, "Documents/DifferentChat");

  const folderPathMagenta = magentaText(folderPath);

  try {
    await fs.promises.mkdir(folderPath);
    logGreen("It looks like it's your first time running DifferentChat.");

    log(
`
This software includes Node.js, which is licensed under the following license:

"""
Copyright Node.js contributors. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
"""
`
    );

    try {
      await fs.promises.mkdir(path.join(folderPath, "logs"));
    } catch (err) {
      log(
        redText("Failed to create the ")
        + logsMagenta
        + " folder."
      );
    }

    try {
      await fs.promises.copyFile(path.join(__dirname, "../resources/settings.txt"), path.join(folderPath, "settings.txt"));
    } catch (err) {
      log(
        redText("Failed to create the ")
        + settingsTxt
        + " file."
      );
    }

    try {
      await fs.promises.copyFile(path.join(__dirname, "../resources/messages.txt"), path.join(folderPath, "messages.txt"));
    } catch (err) {
      log(
        redText("Failed to create the ")
        + messagesTxt
        + " file."
      );
    }

    log(greenText("Your config folder is at ") + folderPathMagenta + greenText("."));

    log(
      greenText("We've created a ")
      + settingsTxt
      + greenText(" and a ")
      + messagesTxt
      + greenText(" file there, so be sure to check that out.")
    );
    log(
      greenText("Your logs will be saved in the ")
      + logsMagenta
      + greenText(" folder.")
      + "\n"
    );

    logGreen("By default, your account will connect to Constantiam.");
    logRed("Please make sure your account is safe. I recommend an obsidian box.\n");
    log("Press any key to continue...");
    await keyPress();
  } catch (ignored) {
    // user has ran it before
  }

  const config = new Config(true);

  config.configDir = folderPath;

  const readConfigFile = file => {
    return fs.promises.readFile(path.join(folderPath, file), { encoding: "utf-8" });
  };

  let lines;
  try {
    lines = (await readConfigFile("settings.txt")).split(/\r?\n/);
  } catch (error) {
    log(
      redText("Failed to read the ")
      + settingsTxt
      + redText(" file. Please make sure you have it in your ")
      + folderPathMagenta
      + redText(" folder.")
    );
    return Config.failure;
  }

  const invalidSyntax = lineNumber => {
    logRed(`Invalid settings syntax on line ${lineNumber}.`);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }
    const lineNumber = i + 1;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) { // if = is not found
      invalidSyntax(lineNumber);
      return Config.failure;
    }
    // Start and end because the trim of the line would do the other ends
    const setting = line.slice(0, equalsIndex).trimEnd();
    const value = line.slice(equalsIndex + 1).trimStart();
    if (value.length === 0) {
      invalidSyntax(lineNumber);
      return Config.failure;
    }

    if (setting === "server") {
      config.server = value;
    } else if (setting === "port") {
      config.port = parseInt(value);
      if (!Number.isSafeInteger(config.port) || config.port < 0 || config.port > 65535) {
        logRed(`Invalid port: ${value}`);
        return Config.failure;
      }
    } else if (setting === "version") {
      config.version = value;
    } else if (setting === "message_delay") {
      config.messageDelay = parseInt(value);
      if (!Number.isSafeInteger(config.messageDelay) || config.messageDelay <= 0) {
        logRed(`Invalid message delay: ${value}`);
        return Config.failure;
      }
    } else if (setting === "message_count") {
      config.messageCount = parseInt(value);
      if (!Number.isSafeInteger(config.messageCount) || (config.messageCount <= 0 && config.messageCount !== -1)) {
        logRed(`Invalid message count: ${value}`);
        return Config.failure;
      }
    } else if (setting === "reconnect_delay") {
      config.reconnectDelay = parseInt(value);
      if (!Number.isSafeInteger(config.reconnectDelay) || config.reconnectDelay <= 0) {
        logRed(`Invalid reconnect delay: ${value}`);
        return Config.failure;
      }
    } else if (setting === "reconnect_tries") {
      config.reconnectTries = parseInt(value);
      if (!Number.isSafeInteger(config.reconnectTries) || (config.reconnectTries < 0 && config.reconnectTries !== -1)) {
        logRed(`Invalid reconnect tries: ${value}`);
        return Config.failure;
      }
    } else {
      logRed(`Unknown setting on line ${lineNumber}.`);
      return Config.failure;
    }
  }

  if (config.server === undefined || config.port === undefined || config.version === undefined) {
    log(
      redText("You must specify your server, port, and version in the ")
      + settingsTxt
      + " file."
    );
    return Config.failure;
  }

  if (config.messageDelay === undefined || config.messageCount === undefined) {
    log(
      redText("You must specify your message_delay and message_count in the ")
      + settingsTxt
      + " file."
    );
    return Config.failure;
  }

  if (config.reconnectDelay === undefined || config.reconnectTries === undefined) {
    log(
      redText("You must specify your reconnect_delay and reconnect_tries in the ")
      + settingsTxt
      + " file."
    );
    return Config.failure;
  }

  // Read messages
  try {
    config.messages = (await readConfigFile("messages.txt"))
      .split(/\r?\n/)
      .filter(message => message.length > 0);
    if (config.messages.length === 0) {
      log(
        redText("You must specify at least one message in the ")
        + messagesTxt
        + " file."
      );
      return Config.failure;
    }
  } catch (err) {
    log(
      redText("Failed to read the ")
      + messagesTxt
      + redText(" file. Please make sure you have it in your ")
      + folderPathMagenta
      + " folder."
    );
    return Config.failure;
  }

  logGreen(
`Using these settings:
On server ${config.server}${config.port === 25565 ? "" : ":" + config.port.toString()} with version ${config.version}.
Will send ${config.messageCount === -1 ? "unlimited" : config.messageCount} message${config.messageCount === 1 ? "" : "s"} with a delay of ${config.messageDelay}ms.
Will attempt to reconnect ${config.reconnectTries === -1 ? "unlimited" : config.reconnectTries} time${config.reconnectTries === 1 ? "" : "s"} with a delay of ${config.reconnectDelay}ms.
`
  );

  try {
    config.email = await read({
      prompt: magentaText("Please enter your account email:")
    });
    config.password = await read({
      prompt: magentaText("Please enter your account password (will be hidden, but it is being typed):"),
      silent: true
    });
  } catch (err) {
    return Config.failure;
  }

  return config;
}

module.exports = setup;