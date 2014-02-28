goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View2D');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.GeoJSON');
goog.require('ol.source.MapQuest');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');
goog.require('ol.style.Text');


var myDom = {
  'points': {
    'text': document.getElementById('points-text'),
    'align': document.getElementById('points-align'),
    'baseline': document.getElementById('points-baseline'),
    'font': document.getElementById('points-font'),
    'weight': document.getElementById('points-weight'),
    'size': document.getElementById('points-size'),
    'color': document.getElementById('points-color'),
    'outline': document.getElementById('points-outline'),
    'outline-width': document.getElementById('points-outline-width'),
    'maxreso': document.getElementById('points-maxreso')
  },
  'lines': {
    'text': document.getElementById('lines-text'),
    'align': document.getElementById('lines-align'),
    'baseline': document.getElementById('lines-baseline'),
    'font': document.getElementById('lines-font'),
    'weight': document.getElementById('lines-weight'),
    'size': document.getElementById('lines-size'),
    'color': document.getElementById('lines-color'),
    'outline': document.getElementById('lines-outline'),
    'outline-width': document.getElementById('lines-outline-width'),
    'maxreso': document.getElementById('lines-maxreso')
  },
  'polygons': {
    'text': document.getElementById('polygons-text'),
    'align': document.getElementById('polygons-align'),
    'baseline': document.getElementById('polygons-baseline'),
    'font': document.getElementById('polygons-font'),
    'weight': document.getElementById('polygons-weight'),
    'size': document.getElementById('polygons-size'),
    'color': document.getElementById('polygons-color'),
    'outline': document.getElementById('polygons-outline'),
    'outline-width': document.getElementById('polygons-outline-width'),
    'maxreso': document.getElementById('polygons-maxreso')
  }
};

var getText = function(feature, resolution, dom) {
  var type = dom['text'].value;
  var maxResolution = dom['maxreso'].value;
  var text = feature.getProperties().name;

  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  } else if (type == 'wrap') {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};


var createTextStyle = function(feature, resolution, dom) {
  var align = dom['align'].value;
  var baseline = dom['baseline'].value;
  var size = dom['size'].value;
  var weight = dom['weight'].value;
  var font = weight + ' ' + size + ' ' + dom['font'].value;
  var fillColor = dom['color'].value;
  var outlineColor = dom['outline'].value;
  var outlineWidth = parseInt(dom['outline-width'].value, 10);

  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, dom),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth})
  });
};


// Polygons
var createPolygonStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'blue',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      }),
      text: createTextStyle(feature, resolution, myDom.polygons)
    });
    return [style];
  };
};

var vectorPolygons = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'data/geojson/polygon-samples.geojson'
  }),
  style: createPolygonStyleFunction()
});


// Lines
var createLineStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'green',
        width: 2
      }),
      text: createTextStyle(feature, resolution, myDom.lines)
    });
    return [style];
  };
};

var vectorLines = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'data/geojson/line-samples.geojson'
  }),
  style: createLineStyleFunction()
});


// Points
var createPointStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1})
      }),
      text: createTextStyle(feature, resolution, myDom.points)
    });
    return [style];
  };
};

var vectorPoints = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'data/geojson/point-samples.geojson'
  }),
  style: createPointStyleFunction()
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.MapQuest({layer: 'osm'})
    }),
    vectorPolygons,
    vectorLines,
    vectorPoints
  ],
  renderer: 'canvas',
  target: 'map',
  view: new ol.View2D({
    center: [-8161939, 6095025],
    zoom: 8
  })
});

var refreshPoints = function() {
  vectorPoints.setStyle(createPointStyleFunction());
};

var refreshLines = function() {
  vectorLines.setStyle(createLineStyleFunction());
};

var refreshPolygons = function() {
  vectorPolygons.setStyle(createPolygonStyleFunction());
};


/**
 * @param {number} n The max number of characters to keep.
 * @return {string} Truncated string.
 */
String.prototype.trunc = String.prototype.trunc ||
    function(n) {
      return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
    };


// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    for (; p > 0 && (str[p] != ' ' && str[p] != '-'); p--) {
    }
    if (p > 0) {
      var left;
      if (str.substring(p, p + 1) == '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}
