/**
 * FailsDAL is the data access layer module, serving as the interface between DB and the frontend for
 * persisting and retrieving fails parsed from a junit xml.
 */

'use strict';

const _const = require('./constants')
const MongoClient = require('mongodb').MongoClient;
const url = `mongodb://${_const.DB_USERNAME}:${_const.DB_PASSWORD}@${_const.DB_URL}:${_const.DB_PORT}/${_const.DB_NAME}`;

var collection = null;

async function saveToDatabase(platform, parsedFails) {
  const db = await MongoClient.connect(url, { useNewUrlParser: true });
  console.log("Connected to DB");
  const dbo = db.db(_const.DB_NAME);
  collection = dbo.collection(platform);
  collection.createIndex({classname:1, testname:1}, {unique: true})
  for (const failElem of parsedFails) {
    await collection.insertOne(failElem).catch(async (err) => {
      await findAndUpdateFailInDb(failElem);
    })
  }
  db.close();
}

async function findAndUpdateFailInDb(failElem) {
  const response = await collection.updateOne({
    classname         : failElem.classname,
    testname          : failElem.testname,
  },{
    $inc: {
      'fail.numOfFails': 1
    }
  }).catch((err) => {
    console.log("Could update a fail:)");
    console.log(err);
  });
  console.log(response.result);
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
