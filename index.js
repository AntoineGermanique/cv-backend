const cors = require('cors');
const express = require('express');
const app = express();
const save = require('./modules/save/index');
const get = require('./modules/get/index');
const bodyParser = require('body-parser');
var whitelist = ['http://antoinegermanique.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.use('/', get)
app.use('/save', save)

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})