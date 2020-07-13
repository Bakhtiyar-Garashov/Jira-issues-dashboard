## urlParser

A simple utility to parse a URL string into its components

### Install

    npm install urlParser --save

### Result
    Returns a array : ["url","scheme","slash","host","port","path","query","hash"]


### Usage

    var urlParser = require("urlParser");

    var url = "http://www.test.com:80/loremipsum?query#fragment";

    console.log(urlParser(url));
    ["http://www.test.com:80/loremipsum?query#fragment", "http", "//", "www.test.com", "80", "loremipsum", "query", "fragment"]


