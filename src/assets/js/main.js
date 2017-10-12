(function(scoped) {
  scoped(window.jQuery, window.L, window, document);
}(function($, L, W, D) {

  // later 
  $(function() {
    var lmap = L.map('lmap').setView(CITY_HALL, ZOOM),
      markers = {};
    /*    new L.Control.Autocomplete({
          position: "topleft",
          callback: function(location){
            // object of google place is given
            map.panTo(location);
          }
        })
        .addTo(map);*/

    new L.Control.Autocomplete().addTo(lmap);

    // set up layers
    L.esri.tiledMapLayer({
      url: BASEMAP
    }).addTo(lmap);
    L.esri.tiledMapLayer({
      url: BASEMAP_LABELS
    }).addTo(lmap);

    /*    markers.polling = L.marker(CITY_HALL, {
          icon: ICONS.polling
        }).addTo(lmap);*/
  });

  // now 
  var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11',
    CITY_HALL = [39.95262, -75.16365],
    ZOOM = 16,
    BASEMAP = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
    BASEMAP_LABELS = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
    ICONS = {
      home: L.icon({
        iconUrl: 'src/assets/images/home.png',
        iconSize: [32, 37],
      }),
      polling: L.icon({
        iconUrl: 'src/assets/images/polling.png',
        iconSize: [32, 37],
      }),
      congress: L.icon({
        iconUrl: 'src/assets/images/congress.png',
        iconSize: [32, 37],
      }),
      entrance: L.icon({
        iconUrl: 'src/assets/images/e.png',
        iconSize: [24, 24],
      }),
      handi: L.icon({
        iconUrl: 'src/assets/images/h.png',
        iconSize: [24, 24],
      }),
    }
}));

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