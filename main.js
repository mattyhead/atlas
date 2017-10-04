var GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';
var CITY_HALL = [39.95, -75.1642];

var mymap = L.map('lmap').setView(CITY_HALL, 13);

L.tileLayer('//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mymap',
  accessToken: '35ae5b7bf8f0ff2613134935ce6b4c1e'
}).addTo(mymap);
/*
        pwd: {
          url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
          tiledLayers: [
            'cityBasemapLabels'
          ],
          type: 'featuremap'
        },*/