var path = require('path');
const webpack = require('webpack')
module.exports = {

    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: 'file-loader',
                options: {
                    esModule: false,
                },
            }, ],
        }, ],
    },
    mode: "development",
    entry: "./jira-map/urlParser.js",
    watch: true,
    output: {

        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },

};