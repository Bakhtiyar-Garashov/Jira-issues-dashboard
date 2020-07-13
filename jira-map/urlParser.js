const polyline = require('google-polyline');
const proj4 = require('proj4');
const urlSafePolyline = require('./url-safe-polyline/index').default;

const DATA_SEPERATOR = '___';

const BRACKET_LEFT = '..'; // (
const BRACKET_RIGHT = '++'; // )

export const swap = (data) => {
    var ret = {};
    for (var key in data) {
        ret[data[key]] = key;
    }
    return ret;
}


function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function roundNumericValuesInArray(array, precision, callback) {
    var roundedArray = [];

    array.forEach(function round(elem) {
        if (isNumber(elem)) {
            roundedArray.push(parseFloat(elem).toFixed(precision));
        } else if (elem.constructor === Array) {
            var coordPair = roundNumericValuesInArray(elem, precision);

            if (typeof callback === 'function') {
                coordPair = callback(coordPair);
            }

            roundedArray.push(coordPair);
        } else {
            roundedArray.push(elem);
        }
    });

    return roundedArray;
}

//  layers: ['wmsLayer', 'photoLayer', 'wmsBWLayer'],

export const urlShortenMapOther = {
    c: 'mapCoords',
    z: 'mapZoom',
    f: 'features',
    fmob: 'featuresMobile',
    p: 'Point',
    l: 'Line',
    rl: 'RulerLine',
    pg: 'Polygon',
    mp: 'MultiPolygon',
    ls: 'LineString',
    w: 'waypoints',
    fotoradari: 'speedCameras',
    sastregumi: 'traffic',
    bl: 'baseLayers',
    tp7: 'topo75Layer',
    cl: 'wmsLayer',
    pl: 'photoLayer',
    melnbalta_karte: 'wmsBWLayer',
    topografiska_karte: 'topoLayer',
    vektoru_karte: 'vectorLayer',
    pazinojums: 'notification',
    s: 'search',
    interesu_punkti: 'poiLayer',
    nosaukumi: 'labelLayer',
    embed: 'embed',
    c: 'mapCoords',
    z: 'mapZoom',
    f: 'features',
    fmob: 'featuresMobile',
    p: 'Point',
    l: 'Line',
    rl: 'RulerLine',
    pg: 'Polygon',
    mp: 'MultiPolygon',
    ls: 'LineString',
    w: 'waypoints',
    speed_cameras: 'speedCameras',
    trafficjams: 'traffic',
    bl: 'baseLayers',
    cl: 'wmsLayer',
    pl: 'photoLayer',
    black_white_map: 'wmsBWLayer',
    topographic_map: 'topoLayer',
    vector_map: 'vectorLayer',
    pazinojums: 'notification',
    s: 'search',
    poi: 'poiLayer',
    labels: 'labelLayer',
    embed: 'embed'
};

export const getShortenMap = () => {
    return urlShortenMapOther;
}


const urlShortenMap = getShortenMap();




export const urlToProps = function(url) {
    var paramMap = swap(urlShortenMap);

    var props = {};

    url = url.replace(/\/(c|bl)_{1,2}([^_])/g, '/$1___$2');

    if (url.indexOf('f_p') > -1 || url.indexOf('f_pg') > -1 || url.indexOf('f_ls') > -1) {
        url = url.replace('/f_', '/fold___');
    }

    if (url.indexOf('f__p') > -1 || url.indexOf('f__pg') > -1 || url.indexOf('f__ls') > -1) {
        url = url.replace('/f__', '/fgp___'); //feature google polyline
    }

    url = url.replace(/[^_]__[^_]/g, '___');

    url = url.replace(/\.\./g, '(');
    url = url.replace(/\+\+/g, ')');

    var sections = url.split('/');

    //console.log(sections)

    for (var i = sections.length - 1; i >= 0; i--) {
        if (sections[i] == '') {
            continue;
        }

        if (sections[i].indexOf(DATA_SEPERATOR) > -1) {
            var indexTypeEnd = sections[i].indexOf(DATA_SEPERATOR);
            var sectionType = sections[i].substring(0, indexTypeEnd);

            var params = sections[i].slice(indexTypeEnd + DATA_SEPERATOR.length).split('-');
        } else {
            var sectionType = sections[i];
        }


        switch (sectionType) {
            case paramMap['embed']:
                props['embed'] = true;
                break;
            case paramMap['poiLayer']:
                props['poiLayer'] = true;
                break;
            case paramMap['labelLayer']:
                props['labelLayer'] = true;
                break;
            case paramMap['baseLayers']:
                props['baseLayers'] = urlShortenMap[params[0]];
                break;
            case paramMap['notification']:
                props['notification'] = true;
                break;
            case paramMap['speedCameras']:
            case paramMap['traffic']:
                props[urlShortenMap[sectionType]] = true;

                break;
            case paramMap['mapCoords']:

                props['mapCoords'] = [
                    parseFloat(parseFloat(params[0]).toFixed(2)),
                    parseFloat(parseFloat(params[1]).toFixed(2))
                ];
                props['mapZoom'] = parseInt(params[2]);

                break;
            case paramMap['search']:
                props['search'] = [
                    parseFloat(parseFloat(params[0]).toFixed(6)),
                    parseFloat(parseFloat(params[1]).toFixed(6))
                ];
                break;
            case paramMap['waypoints']:
                var coords = params[0].split(',');
                var coordsArr = [];
                for (var c = 0, lenc = coords.length; c < lenc; c += 2) {
                    coordsArr.push([
                        parseFloat(parseFloat(coords[c]).toFixed(2)),
                        parseFloat(parseFloat(coords[c + 1]).toFixed(2))
                    ]);
                }
                props['waypoints'] = coordsArr;
                break;
            case 'fold': //backwars compability for old feature links / from old balticmaps
                //	var indexTypeEnd = sections[i].indexOf( '_' );
                //	var params = sections[i].slice(indexTypeEnd+'_'.length ).split('-');

                props['features'] = [];

                for (var n = 0, len2 = params.length; n < len2; n += 2) {
                    var feature = false;

                    switch (params[n]) {
                        case 'p':
                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: params[n + 1].split(',')
                                }
                            };

                            break;
                        case 'ls':
                        case 'pg':
                            //"f_ls-2704758.65,7735125.34,2701242.54,7737479.60,2702434.96,7740200.75-p-2696019.98,7745778.75-p-2693415.39,7744511.80"
                            var coords = params[n + 1].split(',');
                            var coordsArr = [];
                            for (var c = 0, lenc = coords.length; c < lenc; c += 2) {
                                coordsArr.push([
                                    parseFloat(parseFloat(coords[c]).toFixed(2)),
                                    parseFloat(parseFloat(coords[c + 1]).toFixed(2))
                                ]);
                            }

                            if (params[n] == 'pg') {
                                coordsArr = [coordsArr];
                            }

                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: coordsArr
                                }
                            };

                            break;
                    }

                    if (feature) {
                        props['features'].push(feature);
                    }
                }
                break;
            case 'fgp': //backwards compability for Google polyline-encoded feature links
                props['features'] = [];

                for (var n = 0, len2 = params.length; n < len2; n += 2) {
                    var feature = false;

                    switch (params[n]) {
                        case 'p':
                            var decoded = polyline.decode(decodeURIComponent(params[n + 1]));

                            //var coords = fromEPSG4326(decoded[0]);
                            var coords = proj4('EPSG:4326', 'EPSG:3857', [decoded[0]])


                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: coords
                                }
                            };

                            break;
                        case 'ls':
                        case 'pg':
                            //"f_ls-2704758.65,7735125.34,2701242.54,7737479.60,2702434.96,7740200.75-p-2696019.98,7745778.75-p-2693415.39,7744511.80"
                            //	var coords = params[n+1].split(',');

                            var coordsArr = polyline.decode(decodeURIComponent(params[n + 1]));

                            var coordsArrConverted = [];

                            for (var ii = coordsArr.length - 1; ii >= 0; ii--) {
                                coordsArrConverted.push(proj4('EPSG:4326', 'EPSG:3857', [coordsArr[ii]]));
                            }

                            if (params[n] == 'pg') {
                                coordsArrConverted = [coordsArrConverted];
                            }

                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: coordsArrConverted
                                }
                            };

                            break;
                    }

                    if (feature) {
                        props['features'].push(feature);
                    }
                }
                break;
            case paramMap['features']:
                props['features'] = [];

                for (var n = 0, len2 = params.length; n < len2; n += 2) {
                    var feature = false;

                    switch (params[n]) {
                        case 'p':
                            var decoded = urlSafePolyline.decode(decodeURIComponent(params[n + 1]));

                            var coords = proj4('EPSG:4326', 'EPSG:3857', decoded[0]);

                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: coords
                                }
                            };

                            break;
                        case 'ls':
                        case 'pg':
                            //"f_ls-2704758.65,7735125.34,2701242.54,7737479.60,2702434.96,7740200.75-p-2696019.98,7745778.75-p-2693415.39,7744511.80"
                            //	var coords = params[n+1].split(',');


                            var coordsArr = urlSafePolyline.decode(
                                decodeURIComponent(params[n + 1])
                            );


                            var coordsArrConverted = [];

                            for (var ii = coordsArr.length - 1; ii >= 0; ii--) {
                                //console.log(coordsArr[ii])
                                coordsArrConverted.push(proj4('EPSG:4326', 'EPSG:3857', coordsArr[ii]));
                            }

                            if (params[n] == 'pg') {
                                coordsArrConverted = [coordsArrConverted];
                            }

                            feature = {
                                type: 'Feature',
                                geometry: {
                                    type: urlShortenMap[params[n]],
                                    coordinates: coordsArrConverted
                                }
                            };

                            break;
                    }

                    if (feature) {
                        props['features'].push(feature);
                    }
                }

                break;
        }
    }

    return props;
};