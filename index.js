var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var app = express();

app.use(bodyParser.json({ type: 'application/json' }));
app.use(expressValidator());

var mongo = require('./lib/mongo');

function validateUser(req, res, next) {
  req.checkBody('username', 'invalid username').isAlphanumeric().notEmpty().withMessage('username required');
  req.checkBody('profile_name', 'invalid profile name').notEmpty().withMessage('profile name required');
  req.checkBody('email', 'invalid email').isEmail().notEmpty().withMessage('email required');

  var errors = req.validationErrors();
  if (errors) {
    var response = { errors: [] };
    errors.forEach(function(err) {
      response.errors.push(err.msg);
    });

    res.statusCode = 400;
    return res.json(response);
  }

  next();
}

function lookupUser(req, res, next) {
  var username = req.params.username;
  var collection = mongo.db.collection('users');
  var result = collection.find({ username: username });
  result.toArray(function(err, users) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: ['Could not retrieve user']});
    }
    if (users && users.length === 0) {
      res.statusCode = 404;
      return res.json({ errors: ['User not found'] });
    }

    req.user = users[0];
    next();
  });
}

var user = express.Router();

user.get('/', function(req, res) { });

user.post('/', validateUser, function(req, res) {
  var userData = {
    username: req.body.username,
    profile_name: req.body.profile_name,
    email: req.body.email
  };

  var collection = mongo.db.collection('users');

  collection.insertOne(userData, function(err, result) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      res.json({ errors: ['Could not create user'] });
    }

    res.statusCode = 201;
    res.send(userData);
  });
});

user.get('/:username', lookupUser, function(req, res) {
  res.json(req.user);
});

user.patch('/:username', lookupUser, function(req, res) { });

user.delete('/:username', lookupUser, function(req, res) { });

app.use('/user', user);

module.exports = app;
