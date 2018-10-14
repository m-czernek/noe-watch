const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const xmlparser = require('express-xml-bodyparser')

const mysql = require('mysql')
const con = mysql.createConnection({
  host: "localhost",
  user: "process.env.USER",
  password: "process.env.PASSWORD",
  database: "process.env.DB"
  // insecureAuth : true
});

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

  // const testResults = request.body.testsuite["$"]
  // console.log(request.body)
  // console.log('--------------------')
  // console.log(testResults)
  // console.log(testResults.failures)
  // console.log(testResults.errors)
  // console.log(request.body.testsuite.testcase[0].failure)

  // Get all tests. We should check if we have fails before getting here
  const tests = request.body.testsuite.testcase

  // Get all fails; filter all else
  const fails = tests.filter(function(test) {
    return typeof test.failure != "undefined"
  }).map(failedTest => failedTest.failure)

  console.log("found fails:", fails.length)
  console.log(fails[1][0]['$'])

  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  //   var sql = "INSERT INTO CLASS (FQCN) VALUES ('org.mysql.test')";
  //   con.query(sql, function (err, result) {
  //     if (err) throw err;
  //     console.log("1 record inserted");
  //   });
  // });
  response.sendStatus(200)
})

app.listen(3000)