var mongo = exports;

var MongoClient = require('mongodb').MongoClient;

mongo.db = null;

mongo.initialize = function(url, cb) {
  MongoClient.connect(url, function(err, db) {
    if (err) {
      return cb(err);
    }
  
    mongo.db = db;
    cb();
  });
};
