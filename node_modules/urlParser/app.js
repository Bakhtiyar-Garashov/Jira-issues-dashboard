'use strict';
module.exports = function (url) {
    var urlParser = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

    if(!url) {
        return [];
    } 

     var result = urlParser.exec(url);
     return result;
};
