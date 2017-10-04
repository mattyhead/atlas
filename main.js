var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';
var CITY_HALL = [39.95, -75.1642];

var mymap = L.map('lmap').setView(CITY_HALL, 13);

L.esri.basemapLayer('//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer').addTo(mymap);
/*        pwd: {
          url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
          tiledLayers: [
            'cityBasemapLabels'
          ],
          type: 'featuremap'
        },

L.esri.tiledMapLayer({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer"
  }).addTo(map);

  */