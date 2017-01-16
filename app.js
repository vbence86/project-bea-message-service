const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const smtpConfig = require('./smtp.config.json');
const app = express();
const port = 8095;
const targetEmail = 'nuevasventurasinfo@gmail.com';

function validation(err, req, res, next) {
  if (!req.body) res.status(500).send('Something broke!');
}

function renderEmailBody(data) {
  const now = new Date().toString();
  return `<div><p>You have received a request from ${data.name} at ${now}.</p>
  <p>Name: <b>${data.name}</b></p>
  <p>Age: <b>${data.age}</b></p>
  <p>Email: <b>${data.email}</b></p>
  <p>Introduction: <b>${data.intro}</b></p>
  <p>Request: <b>${data.request}</b></p>

  <p>Please reply to <b>${data.email}</b>!</p>
  `;
}

function sendEmail(data) {
  const account = smtpConfig.account;
  const password = smtpConfig.password;
  const transporter = nodemailer.createTransport(`smtps://${account}%40gmail.com:${password}@smtp.gmail.com`);
  const mailOptions = {
      from: '"Nuevasventuras.es" <info@nuevasventuras.es>',
      to: targetEmail,
      subject: `Request from ${data.name}`,
      html: renderEmailBody(data)
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            reject(error);
        }
        resolve();
    });
  });

}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(validation);

app.post('/email/send', function (req, res) {
  sendEmail(req.body)
  .then(() => {
    res.json({status: 'OK'});
  })
  .catch(err => {
    res.status(500).json(err);
  });
  
});

app.listen(port, function () {
  console.log(`Message Service is listening on port ${port}!`);
});
