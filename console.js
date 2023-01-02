const repl = require('repl');

const Flight = require('./lib/bot/flight.js');
const Alert = require('./lib/bot/alert.js');
const createBrowser = require('./lib/browser.js');
const mongoose = require('./lib/mongo.js');

let replServer = repl.start('>');
replServer.context.Flight = Flight;
replServer.context.Alert = Alert;
replServer.context.mongoose = mongoose;

// helpful page to test if the bot can be detected
replServer.context.headlessTest = function () {
  replServer.context.page.goto('https://infosimples.github.io/detect-headless/');
  replServer.context.page.goto('https://bot.sannysoft.com');
};

createBrowser().then(browser => {
  replServer.context.browser = browser;
  browser.newPage().then(page => replServer.context.page = page);
});
