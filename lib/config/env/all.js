'use strict';

var path = require('path');
var info = require('./info');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
    root: rootPath,
    port: process.env.PORT || 3000,
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    },
    facebook: info.facebook
};