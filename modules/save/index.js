const express = require('express');
const router = express.Router();
const fse = require('fs-extra');
const R = require('ramda');
const jsonPath = './json/';
const bcrypt = require('bcrypt');
const mailer = require('../email/index')

let totalCount = 0;
let count = 0;
const maxTry = 15;
const blockTime = 3600000;
const routes = [
  '/emplois',
  '/etudes',
  '/savoir'
]
const increaseCount = () => { count++ , totalCount++; throw (new Error('wrong credentials')) }
let blocked = false;
const error = () => { throw (new Error('account blocked')) }
const securePwd = () => !blocked ? blockAndSetTimout() : error();
const unBlock = () => { blocked = false; count = 0 };
const block = () => blocked = true
const sendEmail = () => {
  mailer.transporter.sendMail(R.assoc('text', createTextMail(), mailer.mailOptions), mailer.sendingMailCallback)
  return true;
}
const createTextMail = () => 'Warning CV, has been blocked :' + (totalCount / 5) + ' for a total of' + totalCount;
const timeout = () => setTimeout(unBlock, blockTime);
const blockAndSetTimout = () => R.compose(
  error,
  sendEmail,
  timeout,
  block
)()
const catchError = (res, status, msg) => {
  res.status(status);
  return res.send(msg)
}
const canSave = () => count <= maxTry;
const log = (a, b, c) => { console.log(b, c); return a; }
const callback = (route) => (req, res) => {
  const data = req.body;
  fse.readFile('...', 'utf8')
    .then((hash) => canSave() ? hash : securePwd())
    .then(hash => log(hash, 'route', `./json/${data.language}/${route}.json`))
    .then((hash) => bcrypt.compare(data.pwd, JSON.parse(hash).hash))
    .then((same) => same ? fse.writeFile(`./json/${data.language}/${route}.json`, JSON.stringify(data.data)) : increaseCount())
    .then(answer => res.send(answer))
    .catch(_ => {
      console.log(_);
      return canSave() ? catchError(res, 401, 'Wrong credential') : catchError(res, 429, 'Too many wrongs')
    })
}
const post = (callback, route, router) => router.post(route, callback(route))
R.map(route => post(callback, route, router), routes)


module.exports = router