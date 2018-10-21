const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const xmlparser = require('express-xml-bodyparser')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

const app = express()

app.use(xmlparser())

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
  response.render('home', {
    name: 'John'
  })
})

app.post('/api/post/parsexml', (request, response) => {
  const platform = request.query.platform;
  if(!platform) {
    response.sendStatus(400, "Missing platform query parameter")
  }
  // Get all tests. We should check if we have fails before getting here
  const tests = request.body.testsuite.testcase

  // Get all fails -> Map them to an array of custom objects
  const parsedFilteredFailedTests = tests.filter(function(test) {
    return typeof test.failure != "undefined"
  }).map(test => (
    {
      classname:test['$'].classname,
      testname: test['$'].name,
      fail: {
        failMsg: test.failure[0]['$'].message,
        stackTrace: test.failure[0]['_'],
        numOfFails: 1
      }
    })
  )

  console.log("found fails:", parsedFilteredFailedTests.length)
  saveToDatabase(platform, parsedFilteredFailedTests, (res, err) => {
    if(err) {
      response.sendStatus(400, res)
    } else {
      response.sendStatus(200, res)
    }
  })
})
/**
 * Saves parsed fails into the DB.
 * // TODO: MongoDB 
 * @param {*} failInfo 
 */
function saveToDatabase(platform, parsedFails, callback) {

  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) {
      callback(err, true)
      return;
    };
    console.log("Connected to DB");
    var dbo = db.db("noe-db");
    const collection = dbo.collection(platform)

    for (failElem of parsedFails) {
      const isAlreadyInDatabase = await collection.findOne({
        classname         : failElem.classname,
        testname          : failElem.testname,
        'fail.failMsg'    : failElem.fail.failMsg,
        'fail.stackTrace' : failElem.fail.stackTrace
      })
      if(!isAlreadyInDatabase) {
        failElem.fail.numOfFails = 1
        await collection.insertOne(failElem).catch((err) => {
          callback(err, true)
          return;
        });
      } else {
        await collection.updateOne(isAlreadyInDatabase, { $inc: { "fail.numOfFails": 1 } }).catch((err) => {
          callback(err, true)
          return;
        })
      }
    }
    db.close();
    callback("OK", false)
  });
}

app.listen(3000)