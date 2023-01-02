const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const { ALERT_TYPES, MAX_PAGES, CHROME_DEBUG } = require('../constants.js');
const createBrowser = require('../browser.js');
const urlUtil = require('url');

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    console.debug('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Page rendered fully.");
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitFor(checkDurationMsecs);
  }  
};

async function getPriceForFlight ({ from, to, date, number, isPointsBooking, passengerCount, alertType }, browser, lock) {
  const flights = (await getFlights({
    from,
    to,
    departDate: date,
    isPointsBooking: isPointsBooking,
    passengerCount,
    browser,
    lock
  })).outbound;

  let options;
  if (alertType === ALERT_TYPES.SINGLE) {
    options = flights.filter(f => f.number === number);
    if (options.length === 0) {
      options = flights.filter(f => number.split(',').includes(f.number));
    }
  } else if (alertType === ALERT_TYPES.DAY) {
    options = flights;
  } else if (alertType === ALERT_TYPES.RANGE) {
    return;
  }
  const prices = options.map(f => f.price);
  console.log('Min price: ' + Math.min(...prices));
  return Math.min(...prices);
}

async function getFlights ({ from, to, departDate, isPointsBooking, browser, passengerCount, lock }) {
  const fares = { outbound: [] };

  let html = '';

  if (browser === undefined) {
    console.log('Create a new browser as one does not exist.');
    browser = await createBrowser();
    console.log('PID: ' + browser.process().pid);
  }

  try {
    if (lock) {
      console.debug('lock has available permits: ' + lock.getPermits());
      await lock.wait();
      console.debug('Entered lock, available permits: ' + lock.getPermits());
      html = await getPage(from, to, departDate, isPointsBooking, passengerCount, browser);
      await lock.signal();
      console.debug('Exited lock, available permits: ' + lock.getPermits());
    } else {
      html = await getPage(from, to, departDate, isPointsBooking, passengerCount, browser);
    }
  } catch (e) {
    console.log('We have some errors. Uh-oh!');
    if (e.message.includes('ERR_INTERNET_DISCONNECTED')) {
      console.error('Bot was unable to connect to the internet while checking Southwest. Check your connection and try again later.');
    } else {
      console.error(e);
    }
    if (lock) {
      const numPermits = lock.getPermits();
      if (numPermits !== MAX_PAGES) {
	await lock.signal();
      }
    }
  }

  // --Needed to comment out when adding code to help with pages not loading properly--
  // --otherwise the browser would close before we finished processing those pages--
  // --Added code to app.js and check.js to preemptively create browser when needed--
  // --and then close it in each respective location instead of doing it in this code--
  // if the browser isn't closed, the process wil hang in certain environments
  // await browser.close();

  const $ = cheerio.load(html);

  const departingFlights = $(`#air-booking-product-0`).find(`li.air-booking-select-detail`);
  console.log('No. of departing flights found: ' + departingFlights.length)
  if (departingFlights.length) {
    departingFlights.toArray().forEach(e => parseTrip($, e, fares.outbound));
  } else {
    console.error('No flights found!');
  }

  return fares;
}

function parseTrip ($, e, dest, international = false) {
  console.log('------------------ New trip price ---------------');

  const flights = $(e).find('.select-detail--flight-numbers').find('.actionable--text')
    .text()
    .substr(2) // remove "# "
    .split(' / ')
    .join(',');
  console.log('flights: ', flights);

  const stopInfo = $(e).find('.select-detail--flight-stops-badge').text();
  const durationInfo = $(e).find('.select-detail--flight-duration').text();
  let stops = 0;
  if (stopInfo.includes(' ')) {
    const stops_ = stopInfo.split(' '); // '1 stop' -> ['1', 'stop']
    stops = stops_[0] === '' ? 0 : parseInt(stops_[0], 10);
  }
  console.log('stops: ', stops);

  const priceStrDict = {};
  const classes = ['Business Select', 'Anytime', 'Wanna Get Away'];
  $(e).find('.fare-button--text').each(function (i, elem) {
    if ($(this).text() === 'Sold out') {
      priceStrDict[classes[i]] = 'Infinity';
    } else {
      priceStrDict[classes[i]] = $(this).find('.fare-button--value > span > span > span').text();
    }
  });

  let price = Infinity;
  if (Object.keys(priceStrDict).length > 0) {
    for (var key in priceStrDict) {
      let price_ = parseInt(priceStrDict[key].replace(/,|\$/g, ''), 10);
      if (price_ < price) {
        price = price_;
      }
    }
  } else {
    console.error('There were no prices found!');
  }
  console.log('Price: ', price);

  // TODO this is a terrible pattern, which should just return the flight
  dest.push({
    number: flights,
    stops,
    price
  });
}

function createUrl (from, to, departDate, isPointsBooking, passengerCount) {
  const fareType = (isPointsBooking) ? 'POINTS' : 'USD';

  return 'https://www.southwest.com/air/booking/select.html' +
    '?int=HOMEQBOMAIR' +
    '&adultPassengersCount=' + passengerCount +
    '&departureDate=' + dateFormat(departDate, 'yyyy-mm-dd', true) +
    '&destinationAirportCode=' + to +
    '&fareType=' + fareType +
    '&originationAirportCode=' + from +
    '&passengerType=ADULT' +
    '&returnDate=' +
    '&tripType=oneway' +
    '&departureTimeOfDay=ALL_DAY' +
    '&reset=true' +
    '&returnTimeOfDay=ALL_DAY';
}

async function getPage (from, to, departDate, isPointsBooking, passengerCount, browser) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');

  // long timeouts prevent page load from failing via proxies or slow connections
  await page.setDefaultTimeout(1000 * 120);

  await page.setViewport({ width: 1280, height: 800 });

  if (CHROME_DEBUG) {
    console.log('Enabling browser logs');
    await page.on('console', msg => console.log('BROWSER PAGE LOG: ', msg.text()));
  }

  // allows the request callback below to fire
  await page.setRequestInterception(true);

  // don't load images and css to reduce bandwidth usage.
  // many hosted proxies make you pay for bandwidth, this helps lower the cost.
  // https://github.com/GoogleChrome/puppeteer/issues/1913
  await page.on('request', request => {
    const resourceType = request.resourceType();
    const url = request.url();

    if (CHROME_DEBUG) {
      console.log(`attempting to load: ${resourceType}; ${url}`);
      request.continue();
      return;
    }

    if (['font', 'image', 'stylesheet'].indexOf(resourceType) !== -1) {
      if (url.startsWith('data:image')) {
        request.continue();
      } else {
        request.abort();
      }
    } else if (['script', 'document', 'xhr', 'other'].indexOf(resourceType) !== -1) {
      // there are lots of tracking and ad stuff loaded, let's skip that
      if (!urlUtil.parse(url).hostname.includes('southwest.com')) {
        request.abort();
      } else {
        // "other" => favicon
        request.continue();
      }
    } else {
      console.log(`Unknown request type: ${resourceType}; URL: ${url}`);
      request.continue();
    }
  });

  try {
      const url = createUrl(from, to, departDate, isPointsBooking, passengerCount);
      console.log('Retrieving URL: ', url);

      const response = await page.goto(url, {waitUntil: 'networkidle2'});
      await waitTillHTMLRendered(page);
      if (response.status() !== 200) {
          console.log(`response code is not 200: ${response.status()}`);
      }

      try {
          var refreshPage = true;
	  let countButtonPushes = 0;
          while (refreshPage) {
             console.debug('Trying to find prices.');
             try {
                 await page.waitForSelector('.price-matrix--details-titles',{ timeout: 5000 });
                 console.log('Found departing flights!!');
                 refreshPage = false;
             } catch (err) {
                 await page.waitForSelector('#form-mixin--submit-button',{ timeout: 5000 });
                 console.log('Button found!! Click it! - ' + countButtonPushes);
                 countButtonPushes++;
                 await Promise.all([
                     page.waitForNavigation({waitUntil: 'networkidle2'}),
                     page.click('#form-mixin--submit-button')
                 ]);
             }
          } 
      } catch (err) {
          console.error('Unable to get flights');
          await page.screenshot({ path: 'failed.png', fullPage: true })
          console.error(await page.content());
          console.error(response.headers());
          console.error(response.status());
      }
      const html = await page.evaluate(() => document.body.outerHTML);
      await page.goto('about:blank');
      await page.close();
      console.debug('Page closed');
      return html.toString();
  } catch (e) {
    try {
      console.debug('Warning Will Robinson!');
      await page.goto('about:blank');
      await page.close();
    } catch (err) {
    }
    throw e;
  }
}

module.exports = {
  getPriceForFlight,
  getFlights
};
