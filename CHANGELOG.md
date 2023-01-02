### [3.7.0] - 2021-11-26
* Add SMTP email delivery support
* Add Raspberry Pi docker deployment
* Bump node version to 17
* Allow chrome executable path to be customized
* Add GitHub actions
* Allow source and destination airports on alerts to be edited at all times

### [3.6.0] - 2021-11-05
  - Add Docker / Docker-Compose configuration
### [3.5.0] - 2019-08-11
  - Update dependencies, including yarn.lock
  - Update to Node v12
### [3.4.0] - 2019-06-30
  - Move from Redis to MongoDB
  - Update scraping logic
  - Improve proxy support
  - Add some anti-bot detection measures
  - Thanks to @iloveitaly for these changes!
### [3.3.0] - 2018-12-25
  - Add support for award flights (points)
  - Updated dependencies to latest versions
### [3.2.1] - 2018-7-23
  - Merge PR from @GC-Guy to fix proxy support in checks
### [3.2.0] - 2018-7-21
  - Merge PR from @GC-Guy to add support for a proxy
### [3.1.4] - 2018-7-14
  - Update package.json
  - Merge PR from @evliu to target the price list items more dynamically
### [3.1.3] - 2018-6-14
  - Flight data loaded after page is loaded - added wait for .flight-stops selector
  - Change URL to current format
  - Fix test to handle case of no prices found
  - Add tests for expected bad inputs
### [3.1.2] - 2018-5-24
  - Add unit test for Alerts
  - Add additional logging and error handling
  - Attempt to reduce memory usage by manually calling about:blank prior to closing page
  - Add protocol to email link
### [3.1.1] - 2018-5-4
  - Fix bug with crash when email or phone number is not set but respective service is enabled
  - Add semaphore to limit number of pages open at once - hopefully fixing the "Error: Page crashed" error. Limited to 5 pages. Defaults to 5 pages at once - set ENV.MAX_PAGES to change.
### [3.1.0] - 2018-4-29
  - Add checks for invalid error
  - Add notification bars for invalid parameters
### [3.0.1] - 2018-4-28
  - Avoid multiple browser instances during task:check - reduce memory usage
  - Add nodejs buildpack for Heroku deployment
### [3.0.0] - 2018-4-28
  - Refactor to support updated Southwest site redesign, replace osmosis with puppeteer
### [2.1.0] - 2018-4-14
  - Add support for checking for the cheapest flight on a day
### [2.0.1] - 2018-4-9
  - Integrate upstream changes from PetroccoCo (email handling) and pmschartz (redesign)
### [2.0.0] - 2017-12-2
  - Support Mailgun and Plivo (email and sms)
### [1.9.5] - 2017-11-30
  - Support Mailgun
### [< 1.9.5]
  - Prior work
