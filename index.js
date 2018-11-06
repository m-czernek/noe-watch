#!/usr/bin/env node

'use strict';

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const xmlparser = require('express-xml-bodyparser');
const favicon = require('serve-favicon');

const databaseAccessLayer = require('./lib/failsDAL');
const parserUtils = require('./lib/utils');
const _const = require('./lib/constants')

const app = express();

// Use custom CSS in the public directory
app.use(express.static(__dirname + '/public'));

// Use favicon 
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// Use XML as a payload in our POST requests
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
  var project = request.query.project
  if(!project) {
    // Assume default project
    project = "jws"
  }

  databaseAccessLayer.getFails(project).then((res) => {
    databaseAccessLayer.listDbs().then((dbArray) => {
      dbArray.forEach(element => {
        if(element.name === project) {
          element.class = "active";
        }
      });
      response.render('home', {
        project: project,
        dbArray: dbArray,
        winArray: res[_const.WIN],
        rhelArray: res[_const.RHEL],
        solArray: res[_const.SOL]
      });
    })
  });
});

app.get('/readinessProbe', (request, response) => {
  response.sendStatus(200);
});

app.post('/api/post/parsexml', (request, response) => {
  // Check for missing body and platform
  if(!request.query.platform || Object.getOwnPropertyNames(request.body).length === 0) {
    response.send("Missing payload or query parameter").status(400);
    return;
  }

  var project = request.query.project
  if(!project) {
    response.send("Missing project name").status(400);
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

  databaseAccessLayer.saveToDatabase(project, platform, parsedFilteredFailedTests)
    .then(() => {
      response.sendStatus(200);
    })
    .catch((err) => {
      response.send("Error:" + err).status(500);
    });
});

app.listen(3000);