// IIFE - Immediately Invoked Function Expression
(function(deferredCode) {

  // The global jQuery object is passed as a parameter
  deferredCode(window.jQuery, window, document);

}(function($, w, d) {
  // The $ is now locally scoped 
  $(function() {

    // declarations
    var lmap = L.map('lmap').setView(CITY_HALL, ZOOM),
      homeIcon = L.icon({
        iconUrl: 'src/assets/images/home.png',
        iconSize: [32, 37],
      }),
      pollingIcon = L.icon({
        iconUrl: 'src/assets/images/polling.png',
        iconSize: [32, 37],
      }),
      congressIcon = L.icon({
        iconUrl: 'src/assets/images/congress.png',
        iconSize: [32, 37],
      }),
      entranceIcon = L.icon({
        iconUrl: 'src/assets/images/e.png',
        iconSize: [24, 24],
      }),
      handiIcon = L.icon({
        iconUrl: 'src/assets/images/h.png',
        iconSize: [24, 24],
      }),
      markers = {}

    //L.esri.basemapLayer('//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer').addTo(mymap);
    /*

    var marker = L.marker([39.95262, -75.16422], {icon: firefoxIcon}).addTo(map);

            pwd: {
                     url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
                     tiledLayers: [
                       'cityBasemapLabels'
                     ],
                     type: 'featuremap'
                   },

                   //tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer
    geocoder: {
      // methods: {
      forward: {
        url(input) {
          const inputEncoded = encodeURIComponent(input);
          return `//api.phila.gov/ais/v1/search/${inputEncoded}`
        },
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      },
      reverse: {
        // TODO uri encode
        url: (input) => `//api.phila.gov/ais/v1/reverse_geocode/${input}`,
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      }
      // }
    },
        cityBasemapLabels: {
          // type: 'labels',
          url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
          zIndex: '3',
        },

    */

    // set up layers
    L.esri.tiledMapLayer({
      url: "//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer"
    }).addTo(lmap);
    L.esri.tiledMapLayer({
      url: "//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer"
    }).addTo(lmap);



  });

  // The rest of your code goes here!
  var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';
  var CITY_HALL = [39.95262, -75.164];
  var ZOOM = 16
}));