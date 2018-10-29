#!/usr/bin/env node

'use strict';

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const xmlparser = require('express-xml-bodyparser');

const databaseAccessLayer = require('./lib/failsDAL');
const parserUtils = require('./lib/utils');
const _const = require('./lib/constants')

const app = express();

// Use custom CSS in the public directory
app.use(express.static(__dirname + '/public'));

app.use(xmlparser());

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials/')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (request, response) => {
  databaseAccessLayer.getFails().then((res) => {
    response.render('home', {
      winArray: res[_const.WIN],
      rhelArray: res[_const.RHEL],
      solArray: res[_const.SOL]
    });
  });
});

app.get('/readinessProbe', (request, response) => {
  response.sendStatus(200);
})

app.post('/api/post/parsexml', (request, response) => {
  // Check for missing body and platform
  if(!request.query.platform || Object.getOwnPropertyNames(request.body).length === 0) {
    response.send("Missing payload or query parameter").status(400);
    return;
  }
  const platform = request.query.platform.toString().trim().toLowerCase();

  if(!parserUtils.containsFailsOrErrors(request.body)) {
    console.log("Found no fails nor errors, returning");
    response.send("No fails or errors found").status(200);
    return;
  }
  
  const parsedFilteredFailedTests = parserUtils.parseBodyXml(request.body, platform);
  console.log("found fails:", parsedFilteredFailedTests.length);

  databaseAccessLayer.saveToDatabase(platform, parsedFilteredFailedTests, (res, err) => {
    if(err) {
      response.send(res).status(400);
    } else {
      response.sendStatus(200);
    }
  });
})

app.listen(3000);