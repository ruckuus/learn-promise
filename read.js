'use strict';

var parser = require('csv-parse');
var fs = require('fs');
var fsPromise = require('fs');
var Promise = require('bluebird');

Promise.promisifyAll(fsPromise);

var parseCsv = function(data, callback) {
  parser(data, function(err, lines) {
    if (!err) {
      // proceed lines
      for (var line of lines) {
        callback(0, line);
      }
    }
    callback(-1);
  })
};

var parseCsvPromise = function(data)
{
  return new Promise(function(resolve, reject) {
    parser(data, function(err, lines) {
      if (err) {
        reject(err);
      }
      // Interesting
      // can't behave like callback version
      resolve(lines);
    });
  });
}

var postToSmsGateway = function(data, callback)
{
  // Construct object to be sent to smssoap
  var msisdn = data[0],
      text = data[1];

  var success = {
    'message' : 'Successfully sent to: ' + msisdn
  }

  callback(0, success);
}

var postToSmsGatewayPromise = function(data)
{
  return new Promise(function(resolve, reject) {
    var msisdn = data[0],
        text = data[1];

    var success = {
      'message' : 'Successfully sent to: ' + msisdn
    }

    var err = false;
    if (err) {
      reject(err);
    }

    resolve(success);
  });
}

var logS3 = function(data, callback)
{
  // publish to S3 log
  var log = {
    message: 'S3 LOG: Successfully publish to S3.'
  };

  callback(0, log);
}

var logS3Promise = function(data)
{
  return new Promise(function(resolve, reject) {
    // publish to S3 log
    var log = {
      message: 'S3 LOG: Successfully publish to S3.'
    };
    var err = false;

    if (err) {
      reject(err);
    }

    resolve(log);

  });
}

var doparse = function(file)
{
  fs.readFile(file, 'utf8', function(err, data) {
    if (!err) {
      // Parse CSV
      parseCsv(data, function(err, line) {
        if (!err) {
          // post to SmsGateway
          postToSmsGateway(line, function(err, result) {
            if (!err) {
              console.log(result);
              // publish to S3
              logS3(result, function(err, res) {
                if (!err) {
                  console.log(res);
                }
              });
            }
          })
        }
      });
    }
  });
}

var readCsv = function(csv) {
  return fsPromise.readFileAsync(csv, 'utf8');
}

var doParsePromise = function(file)
{
  readCsv(file)
    .then(function(data) { return parseCsvPromise(data); }).map(function(line) {
      return postToSmsGatewayPromise(line);
    }).map(function(result) {
      return logS3Promise(result);
    }).map(function(out) { console.log(out) });
}

//doparse('FAILED.csv');
doParsePromise('FAILED.csv');
