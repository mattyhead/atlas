var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';
var CITY_HALL = [39.95, -75.1642];

var lmap = L.map('lmap').setView(CITY_HALL, 13);

//L.esri.basemapLayer('//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer').addTo(mymap);
/*        pwd: {
          url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
          tiledLayers: [
            'cityBasemapLabels'
          ],
          type: 'featuremap'
        },

        //tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer
*/
L.esri.tiledMapLayer({
  url: "//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer"
}).addTo(lmap);
L.esri.tiledMapLayer({
  url: "//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer"
}).addTo(lmap);