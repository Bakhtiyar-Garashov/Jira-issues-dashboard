const fs = require('fs');
import { urlToProps } from '../jira-map/urlParser'


const DOMAIN = 'balticmaps.eu'; // constant for url extraction
const BASE_ISSUE_URL = 'https://kijsss.atlassian.net/browse/' //base url of Jira issues dashboard
let feature_list = [];

// read json from file and handle data
fs.readFile('data-from-jira.json', (err, data) => {
    if (err) throw err;
    let result = JSON.parse(data);
    let issues = result.issues;

    //iterate over json to extract
    for (const key in issues) {
        const each_entry = issues[key];
        const description = each_entry['fields']['description'];

        const pattern = new RegExp(/(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/igm);
        var matched = description.match(pattern);

        if (matched) {
            var useful_desc = description;
            var issue_url = BASE_ISSUE_URL + each_entry.key;
            matched.forEach(element => {
                if (element.includes(DOMAIN)) {

                    // pass url to deconding script to get props
                    var entry = urlToProps(element);
                    if (JSON.stringify(entry) !== "{}") {
                        var each_enrty = entry['features'];
                        each_enrty.forEach(iter => {
                            const property = { url: issue_url, description: useful_desc }
                            iter.properties = property;

                            // convert type of coordinates to number
                            if (!(iter.geometry.coordinates[0] instanceof Array)) {
                                for (let index = 0; index < iter.geometry.coordinates.length; index++) {
                                    iter.geometry.coordinates[index] = parseFloat(iter.geometry.coordinates[index]);
                                }
                            };
                            feature_list.push(iter);
                        });
                    }
                };
            });
        };
    };

    // complete js object
    var json_object = {
        type: "FeatureCollection",
        name: "Jira issues",
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::4326" } },
        features: feature_list
    };

    // simple http that returns json
    var http = require('http');
    var app = http.createServer(function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json_object));
    });
    app.listen(5000);
});

