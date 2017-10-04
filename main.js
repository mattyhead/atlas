// IIFE - Immediately Invoked Function Expression
(function(yourcode) {

  // The global jQuery object is passed as a parameter
  yourcode(window.jQuery, window, document);

}(function($, w, d) {
  var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';
  var CITY_HALL = [39.9526, -75.1642];

  // The $ is now locally scoped 
  $(function() {

    // The DOM is ready!
    var lmap = L.map('lmap').setView(CITY_HALL, 18);

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
  });

  // The rest of your code goes here!

}));