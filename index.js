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
        stackTrace: test.failure[0]['_']
      }
    })
  )

  console.log("found fails:", parsedFilteredFailedTests.length)
  saveToDatabase(platform, parsedFilteredFailedTests)

  response.sendStatus(200)
})
/**
 * Saves parsed fails into the DB.
 * // TODO: MongoDB 
 * @param {*} failInfo 
 */
function saveToDatabase(platform, parsedFails) {

  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) throw err;
    console.log("Connected to DB");
    var dbo = db.db("noe-db");
    const collection = dbo.collection(platform)

    for (failElem of parsedFails) {
      isAlreadyInDatabase = await collection.findOne(failElem)
      if(!isAlreadyInDatabase) {
        failElem.fail.numOfFails = 1
      } else {
        failElem = isAlreadyInDatabase
        failElem.fail.numOfFails += 1;
      }
    }

    console.log(parsedFails)
    //currfail = await collection.findOne(failInfo)

    //console.log(currfail)
    
    // dbo.collection("fails").insertOne(failInfo);
    db.close();
  });
}

app.listen(3000)