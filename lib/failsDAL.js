'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "noe-db"

var collection = null;

function saveToDatabase(platform, parsedFails, callback) {
  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) {
      console.error(err)
      callback(err, true)
      return;
    };
    console.log("Connected to DB");
    const dbo = db.db(dbName);
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

async function getFails() {
  return await getFailsForPlatform('windows','rhel', 'solaris');
}

async function getFailsForPlatform(...platforms) {
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const dbo = client.db(dbName);
  const result = [];
  for(var i = 0; i < platforms.length; i++) {
    const currPlatform = await retrieveResultsFromDb(dbo,platforms[i])
    if(currPlatform.length > 0) {
      result.push(currPlatform);
    }
  }
  client.close();
  console.log("from failsForPlatforms", result.length);
  return result;
}

async function retrieveResultsFromDb(dbo, collection) {
  const results = [];
  const cursor = dbo.collection(collection).find();
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    results.push(doc)
  }
  console.log("from retrieve: ",results.length)
  return results;
}


module.exports = {
  saveToDatabase,
  getFails,
  getFailsForPlatform
}