'use strict';

const _const = require('./constants')
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${_const.DB_USERNAME}:${_const.DB_PASSWORD}@${_const.DB_URL}:${_const.DB_PORT}/${_const.DB_NAME}`;

var collection = null;

function saveToDatabase(platform, parsedFails, callback) {
  MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
    if (err) {
      console.error(err)
      callback(err, true)
      return;
    };
    console.log("Connected to DB");
    const dbo = db.db(_const.DB_NAME);
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
  return await getFailsForPlatform(_const.PLATFORMS_ARRAY);
}

async function getFailsForPlatform(platforms) {
  const client = await MongoClient.connect(url, { useNewUrlParser: true })
  const dbo = client.db(_const.DB_NAME);
  var result = new Object();
  for(const platform of platforms) {
    const currPlatformFailArray = await retrieveResultsFromDb(dbo, platform);
    result[platform] = currPlatformFailArray
  }
  client.close();
  return result;
}

async function retrieveResultsFromDb(dbo, collection) {
  const results = [];
  const cursor = dbo.collection(collection).find();
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    results.push(doc)
  }
  return results;
}


module.exports = {
  saveToDatabase,
  getFails,
  getFailsForPlatform
}