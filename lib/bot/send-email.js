const Mailgun = require('mailgun-js');
const nodemailer = require("nodemailer");

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SMS_GATEWAYS } = require('../constants.js');

const mailGunEnabled = Boolean(MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILGUN_EMAIL);
const smtpEnabled = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD && SMS_GATEWAYS);
const fromDefault = MAILGUN_EMAIL || SMTP_FROM
const enabled = smtpEnabled || mailGunEnabled;

async function sendEmail (to, subject, message, from = fromDefault) {
  if (!enabled) return false;

  const toDomain = to.split('@')[1];
  const params = {
    from: from,
    to: to,
    text: message
  };

  if (SMS_GATEWAYS.indexOf(toDomain) === -1) {
    params.subject = subject;
  }

  if(smtpEnabled) {
    console.log('Sending email via SMTP');
    const transporter = getSMTP();
    return await transporter.sendMail(params);
  }

  const mg = getMailgun();

  return new Promise(resolve => {
    mg.messages().send(params, function (error, body) {
      if (error) {
        console.log('Error: ' + error);
      } else {
        console.log(body);
      }
      resolve({
        error,
        body
      });
    });
  });
}

function getMailgun () {
  return new Mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN
  });
}

function getSMTP() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

module.exports = {
  enabled,
  sendEmail
};
