# ALERT!
Deployed versions prior to 6/30/2019 (< 3.4.0) might want to do a clean deployment - we're changing from Redis to MongoDB, and it doesn't translate, cleanly. This is able to run locally during development somewhat consistently.

# Southwest Price Drop Bot

This tool lets you monitor the price of Southwest flights that you've booked. It will notify you if the price drops below what you originally paid. Then you can [re-book the same flight](http://dealswelike.boardingarea.com/2014/02/28/if-a-southwest-flight-goes-down-in-price/) and get Southwest credit for the price difference. This tool also lets you monitor the price of all Southwest flights on a given day. It will notify you if any flight on that day drops below the previous cheapest flight.

Note that to send text messages you need a [Plivo](https://www.plivo.com) account and to send emails you'll need a [Mailgun](https://www.mailgun.com) account (or SMTP credentials). You can also send discord alerts through a webhook. You can run this tool without these accounts, but you won't get the notifications.

You can log in with either:

- The admin username/password combo, example: `admin` and `the-admin-password-123`
- A username/password combo, example: `mom` and `the-admin-password-123`

The second option is nice when giving out access to friends and family since it will only display alerts for the given username.  Note that the password is the same for all accounts, and the admin can see all alerts.

When creating alerts, note that the email and phone numbers are optional. If those are both left blank, the user will need to manually log in to view price drops.

## Deployment

1. Click this button: [![deploy][deploy-image]][deploy-href]
1. Create a MongoDB Atlas database and note the connection string then add this string as a config variable named MONGODB_URI
1. Fill out the remaining config variables and click `Deploy`
1. Open up the `Heroku Scheduler` from your app's dashboard
1. Add an hourly task that runs `npm run task:check`

When updates become available, you will have to deploy them yourself using the [Heroku CLI](https://devcenter.heroku.com/articles/git).  This app follows [SemVer](http://semver.org/) in its versioning, so make sure to read the release notes when deploying a major version change.

Note: Deployed versions prior to 4/9/2018 using Mailgun will need to verify constants: `MAILGUN_DOMAIN` and `MAILGUN_EMAIL`.

Note: Deployed versions prior to 4/28/2018 (< 3.0.0) on Heroku will need to install the buildpack https://github.com/jontewks/puppeteer-heroku-buildpack

Note: Deployed versions prior to 7/21/2018 (< 3.2.0) on Heroku will need to verify the `PROXY` constant if you want to use a proxy to make the calls.

Note: Deployed versions prior to 6/30/2019 (< 3.4.0) might want to do a clean deployment - we're changing from Redis to MongoDB, and I don't think it will migrate cleanly (or at all). Otherwise, you'll need to add the mLab MongoDB add-on manually.

## Screenshots

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/welcome-no-alerts.png">
    <img src="./screenshots/welcome-no-alerts.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/new-alert.png">
    <img src="./screenshots/new-alert.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-list.png">
    <img src="./screenshots/web-list.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/web-detail.png">
    <img src="./screenshots/web-detail.png" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/email-alert.jpeg">
    <img src="./screenshots/email-alert.jpeg" height="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/samyun/southwest-price-drop-bot/master/screenshots/sms.png">
    <img src="./screenshots/sms.png" height="400" />
  </a>
</kbd>

## Southwest Bot Protection

Southwest has some very fancy bot protections in place.

* Heroku IPs (which is hosted on AWS), and other hosting providers, are blocked from accessing their site. Local deployments should be permitted to access their site, and some other cloud providers may work as well. The most reliable workaround is using a residential proxy service.
* There's also some tricky and obfuscated Javascript that detects headless browsers and is updated very frequently. There's a community of folks that implement headless chrome detection evasions, but it's a cat and mouse game.
  * https://github.com/paulirish/headless-cat-n-mouse/blob/master/apply-evasions.js
  * [puppeteer-extra-plugin-stealth](https//github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth/) (which is used in this propjectg)
  * https://github.com/shirshak55/scrapper-tools
* Use `CHROME_DEBUG=true DEBUG="puppeteer:*"` combined with `node inspect` to debug strange chrome issues.
   * Request interception will log all URL load attempts and accept all requests.
   * `slowmo` is enabled and `headless` is disabled
   * `https://infosimples.github.io/detect-headless` will be opened before a Southwest URL


## Proxy information

Instructions on deploying a proxy is outside the scope of this project. However, here's some information about proxies that might be useful:

* A hosted (cheap) proxy that works is https://luminati.io. It's less than $1 each month and seems reliable. Most public proxies don't seem to work, I imagine there is some sort of public proxy block list that is in place.
* You could use something like [Squid](http://www.squid-cache.org) and spin in up natively, in a container, or in a VM. Obviously you'll want to do this outside of Heroku
* If you do use Squid, you'll want to set up port forwarding or running on a high random port, and locking down `squid.conf` with something like this to prevent someone from using your setup as an open proxy:

```
acl swa dstdomain .southwest.com
http_access allow swa
http_access deny all
```

To configure the Price Drop Bot to use your proxy, define a new `PROXY` variable within the Heroku Config. The proxy format should be http://IP:port. Example: `heroku config:set PROXY='http://123.123.123.123:1234'`

## Development

To run the test suite:

```shell
yarn test
```

To run a console loaded up with `Alert` and `Flight` objects:

```shell
yarn console
```

When debugging chrome/puppeteer issues it's helpful to use the following command:

```shell
DEBUG="puppeteer:*" CHROME_DEBUG=true node tasks/check.js
```

This will send helpful chromium debugging output into your console, switch off headless mode, and enable some additional
logging to help debug what might be going wrong.

### Chromium Codesign Issues

If you are [running into firewall notifications on macos](https://github.com/puppeteer/puppeteer/issues/4752), you'll need to sign the chromium binary:

```shell
/usr/bin/find . -name "Chromium.app" | xargs sudo codesign --sign - --force --deep
```

## Docker Deployment

There are 3 containers in the docker setup:

 - **mongo** - container running mongodb
 - **nodeapp** - container running the frontend
 - **nodescheduler** - container running the check every 60 minutes

To run via docker-compose:

Create your .env file from the example. Set the mongo DB url like:

```shell
MONGODB_URI="mongodb://mongodb:27017/sw_db"
```

Then you can start up the docker instance.

```shell
docker-compose build
```

```shell
docker-compose up -d
```

The interface will be available on http://\<*dockerhost*\>:3000

## Raspberry Pi Docker Deployment

There's a separate `docker-compose` and `Dockerfile` for the Raspberry Pi. Chrome installation on a raspberry pi device works differently, and it doesn't support mongodb by default.

```shell
docker-compose -f docker-compose.pi.yml up -d
```

## [Changelog](CHANGELOG.md)

## Attribution

This is a fork of [minamhere's fork](https://github.com/minamhere/southwest-price-drop-bot) of [maverick915's fork](https://github.com/maverick915/southwest-price-drop-bot) of [scott113341's original project](https://github.com/scott113341/southwest-price-drop-bot).

Downstream changes were integrated from:
  * [PetroccoCo](https://github.com/PetroccoCo/southwest-price-drop-bot) - Email Handling
  * [pmschartz](https://github.com/pmschartz/southwest-price-drop-bot) - Redesign

Thanks to the following for their contributions:
  * @evliu - target the price list items more dynamically
  * @GC-Guy - proxy support
  * @iloveitaly - MongoDB, updated scraping/proxy support, anti-bot detection
  * @ribordy - lodash fix


[deploy-image]: https://www.herokucdn.com/deploy/button.svg
[deploy-href]: https://heroku.com/deploy
