require('dotenv').config({ silent: true });

const ENV = process.env;

const ADMIN_NAME = ENV.ADMIN_NAME || ENV.USER_NAME || 'admin';
const PASSWORD = ENV.PASSWORD || ENV.USER_PASSWORD || 'password';
const PROXY = ENV.PROXY;
const CHROME_EXECUTABLE = ENV.CHROME_EXECUTABLE
const CHROME_DEBUG = ENV.CHROME_DEBUG === 'true';
const BASE_URL = ENV.BASE_URL || 'http://localhost/';

const DEVELOPMENT = ENV.DEVELOPMENT === 'true';

const PLIVO_ID = ENV.PLIVO_ID;
const PLIVO_TOKEN = ENV.PLIVO_TOKEN;
const PLIVO_NUMBER = ENV.PLIVO_NUMBER;

const MAILGUN_API_KEY = ENV.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = ENV.MAILGUN_DOMAIN;
const MAILGUN_EMAIL = ENV.MAILGUN_EMAIL;


const SMTP_HOST = ENV.SMTP_HOST;
const SMTP_PORT = ENV.SMTP_PORT;
const SMTP_USER = ENV.SMTP_USER;
const SMTP_PASSWORD = ENV.SMTP_PASSWORD;
const SMTP_FROM = ENV.SMTP_FROM;

const PORT = ENV.PORT || 3000;
const MONGODB_URI = ENV.MONGODB_URI;

const MAX_PAGES = ENV.MAX_PAGES || 5;

const SMS_GATEWAYS = [
  'txt.att.net',
  'tmomail.net',
  'vtext.com',
  'pm.sprint.com',
  'messaging.sprintpcs.com',
  'vmobl.com',
  'mmst5.tracfone.com',
  'mymetropcs.com',
  'myboostmobile.com',
  'mms.cricketwireless.net',
  'ptel.com',
  'text.republicwireless.com',
  'msg.fi.google.com',
  'tms.suncom.com',
  'message.ting.com',
  'email.uscc.net',
  'cingularme.com',
  'cspire1.com'
];

const ALERT_TYPES = {
  SINGLE: 'SINGLE',
  DAY: 'DAY',
  RANGE: 'RANGE'
};

module.exports = {
  ADMIN_NAME,
  PASSWORD,
  PROXY,
  BASE_URL,
  CHROME_DEBUG,
  CHROME_EXECUTABLE,
  DEVELOPMENT,
  PLIVO_ID,
  PLIVO_TOKEN,
  PLIVO_NUMBER,

  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_EMAIL,

  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,

  PORT,
  MONGODB_URI,
  SMS_GATEWAYS,
  ALERT_TYPES,
  MAX_PAGES
};
