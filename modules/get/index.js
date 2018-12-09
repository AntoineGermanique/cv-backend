const express = require('express');
const router = express.Router();

const en = 'en/';
const fr = 'fr/';
const fs = require('fs');
const jsonPath = './json/';
const R = require('ramda');
const formatRoute = a => '/' + a;
const formatFilePath = a => jsonPath + a + '.json';

const appGet = (router, reqCallback, route) => router.get(formatRoute(route), reqCallback(formatFilePath(route)))
const routes = [
  'info',
  'cv',
  'emplois',
  'etudes',
  'langues',
  'savoir',
  'expo',
  'asso',
  'hobbies',
  'menu'
]
const addLanguage = language => a => language + a;
const addLanguages = (language, routes) => R.map(addLanguage(language), routes)
const allRoutes = R.concat(addLanguages(fr, routes), addLanguages(en, routes))

const reqCallback = (path) => (req, res) => {
  fs.readFile(path,'utf8', (err, data) => {
    res.type('json');
    res.send(data.trim());
  });
}
R.map(route => appGet(router, reqCallback, route), allRoutes)
module.exports = router