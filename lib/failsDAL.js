'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

var collection = null;

function saveToDatabase(platform, parsedFails, callback) {
  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) {
      console.error(err)
      callback(err, true)
      return;
    };
    console.log("Connected to DB");
    const dbo = db.db("noe-db");
    collection = dbo.collection(platform);
    for (const failElem of parsedFails) {
      findAndUpdateFailInDb(failElem);
    }
    db.close();
    callback("OK", false);
  });
}

async function findAndUpdateFailInDb(failElem) {
  try {
    await collection.updateOne({ 
      classname         : failElem.classname,
      testname          : failElem.testname,
      'fail.failMsg'    : failElem.fail.failMsg,
      'fail.stackTrace' : failElem.fail.stackTrace
    }, {
      $inc: {
        'fail.numOfFails': 1
      }
    }, {
      upsert: true
    });
  } catch (e) {
    console.error('Failing to write to a DB');
    console.error(e);
    throw e;
  }
}


module.exports = {
  saveToDatabase
}