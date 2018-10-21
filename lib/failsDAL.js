'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

var collection = null;

function saveToDatabase(platform, parsedFails, callback) {
  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) {
      callback(err, true)
      return;
    };
    console.log("Connected to DB");
    const dbo = db.db("noe-db");
    collection = dbo.collection(platform)
    for (const failElem of parsedFails) {
      const isAlreadyInDatabase = findFailInCollection(failElem)
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

async function findFailInCollection(failElem) {
  return await collection.findOne({
      classname         : failElem.classname,
      testname          : failElem.testname,
      'fail.failMsg'    : failElem.fail.failMsg,
      'fail.stackTrace' : failElem.fail.stackTrace
    })
}


module.exports = {
  saveToDatabase
}