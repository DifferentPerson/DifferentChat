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

const readline = require("readline");
const mineflayer = require("mineflayer");

const { logMagenta, logRed, greenText, redText, magentaText, log } = require("./log");

const { getDateString, getLogTimestamp } = require("./utils");

async function main(config) {

  const { messageDelay, messageCount, messages, reconnectDelay, reconnectTries } = config;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt(magentaText("DifferentChat> "));

  const logWithRl = text => {
    rl.output.write("\x1b[2K\r");
    log(text);
    rl._refreshLine();
  };

  logMagenta("Logging in...");

  const options = {
    host: config.server,
    port: config.port,
    username: config.email,
    password: config.password,
    version: config.version,
    logErrors: false
  };

  let bot;
  try {
    bot = mineflayer.createBot(options);
  } catch (err) {
    logRed("Error during bot creation");
    throw err;
  }

  let logFile;
  bot.on("login", () => {
    try {
      logFile = fs.createWriteStream(
        path.resolve(config.configDir, `logs/DifferentChatLog-${bot.username}-${getDateString()}.txt`),
        { flags: "a" }
      );
    } catch (e) {
      logRed("Failed to open the log file. Please contact support for help.");
      console.error(e);
      rl.close();
    }
  });

  let messageNum = 0;
  let retryAttempts = 0;
  let shouldQuit = false;
  let messageCounter = 0;

  let messageLoop;

  const attachListeners = () => {
    bot.on("error", err => {
      const message = err.message;
      if (message.startsWith("Invalid credentials")) {
        logWithRl(redText("Your provided credentials were invalid."));
        rl.close();
      } else if (message.startsWith("Forbidden")) {
        logWithRl(redText("You have been ratelimited from the game authentication servers. Wait a few minutes and try again."));
        rl.close();
      } else if (message.includes("ECONNRESET")) {
        logWithRl(redText("You were kicked from the server."));
      } else if (message.includes("authserver.mojang.com")) {
        logWithRl(redText("Failed to connect to the game authentication servers. They may be down for maintenance, or you may just have bad internet."));
      } else {
        logWithRl(redText("There was an error while running DifferentChat:"));
        console.error(err);
      }
    });

    bot.on("end", e => {
      if (shouldQuit) {
        return;
      }
      logWithRl(greenText("The bot was disconnected."));
      clearInterval(messageLoop);
      if (reconnectTries === -1 || (++retryAttempts <= reconnectTries)) {
        logWithRl(greenText(`Reconnecting in ${reconnectDelay}ms...`));
        setTimeout(() => {
            bot = mineflayer.createBot(options);
            attachListeners();
        }, reconnectDelay);
      } else {
        logWithRl(redText("Exceeded maximum retry attempts."));
        rl.close();
      }
    });

    bot.on("message", jsonMsg => {
      logWithRl(jsonMsg.toAnsi());
      const plainText = jsonMsg.toString();
      if (plainText.startsWith("<")) {
        const endOfUsername = plainText.indexOf(">");
        if (endOfUsername !== -1) {
            const username = plainText.slice(1, endOfUsername);
            const message = plainText.slice(endOfUsername + 2);
            
            logFile.write(`[${getLogTimestamp()}] <${username}> ${message}\n`);

            if (username === bot.username) {
                if (messages.includes(message) && messageCount !== -1) {
                    messageCounter++;
                    if (messageCounter >= messageCount) {
                        logWithRl(greenText(`Reached ${messageCount} messages.`));
                        rl.close();
                    }
                }
            }
        }
      }
    });

    messageLoop = setInterval(() => {
      bot.chat(messages[messageNum]);
      if (++messageNum >= messages.length) {
        messageNum = 0;
      }
    }, messageDelay);
  };

  attachListeners();

  const handleCommand = async commandAndArgs => {
    const [command, ...args] = commandAndArgs.split(/\s+/g);
    switch (command) {
      case "help":
        logWithRl(greenText(
`
DifferentChat Help:
The prefix is "."

.help - Display this message
.quit - Leave the server
.messages - See how many messages you have sent so far

Join the Discord for more info: https://discord.gg/[REDACTED]
`
        ));
        break;
      case "quit":
        logWithRl(greenText("Quitting..."));
        rl.close();
        break;
      case "messages":
        logWithRl(greenText("You have sent ") + magentaText(messageCounter.toString()) + greenText(` message${messageCount === 1 ? "" : "s"} so far.`));
        break;
      default:
        logWithRl(greenText("Unknown command: ") + `"${command}"`);
    }
  }

  for await (const line of rl) {
    const trimmedLine = line.trim();
    if (trimmedLine.length !== 0) {
      if (trimmedLine.startsWith(".")) {
        handleCommand(trimmedLine.slice(1));
      } else {
        bot.chat(line);
      }
    }
  }

  shouldQuit = true;
  bot.quit();

  try {
    logFile.close();
  } catch (ignored) {
    // file wasn't opened
  }

}

module.exports = main;