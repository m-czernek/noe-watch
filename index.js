#!/usr/bin/env node

'use strict';

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const xmlparser = require('express-xml-bodyparser');

const databaseAccessLayer = require('./lib/failsDAL');
const parserUtils = require('./lib/utils');

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
      winArray: res['windows'],
      rhelArray: res['rhel'],
      solArray: res['sol']
    });
  });
});

app.post('/api/post/parsexml', (request, response) => {
  const platform = request.query.platform.toString().trim().toLowerCase();
  if(!platform) {
    response.sendStatus(400, "Missing platform query parameter");
  }

  if(!parserUtils.containsFails(request.body)) {
    console.log("Found no fails, returning");
    response.sendStatus(200, "No fails found");
  }
  
  const parsedFilteredFailedTests = parserUtils.parseBodyXml(request.body, platform);
  console.log("found fails:", parsedFilteredFailedTests.length);

  databaseAccessLayer.saveToDatabase(platform, parsedFilteredFailedTests, (res, err) => {
    if(err) {
      response.sendStatus(400, res);
    } else {
      response.sendStatus(200, res);
    }
  })
})

app.listen(3000);