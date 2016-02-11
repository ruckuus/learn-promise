'use strict';

var parser = require('csv-parse');
var fs = require('fs');

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

var postToSmsGateway = function(data, callback)
{
  // Construct object to be sent to smssoap
  var msisdn = data[0],
      text = data[1];

  var success = {
    'message' : 'Successfully sent to: ' + msisdn
  }

  callback(0, success);
  // smssoap(msisd, text, function(err, result) {
  //  if (!err) {
  //    callback(0, result);
  //  }
  // });
}

var logS3 = function(data, callback)
{
  // publish to S3 log
  var log = {
    message: 'S3 LOG: Successfully publish to S3.'
  };

  callback(0, log);
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

doparse('FAILED.csv');
