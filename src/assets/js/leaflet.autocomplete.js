(function($) {
  L.Autocomplete = {}

  L.Control.Autocomplete = L.Control.extend({
    options: {
      position: "topright",
      prepend: true,
      collapsed_mode: false
    },
    collapsedModeIsExpanded: true,
    icon: null,
    searchBox: null,

    initialize: function(options) {
      if (options) {
        L.Util.setOptions(this, options)
      }
      this._buildContainer()
    },

    _buildContainer: function() {
      // build structure
      this.container = L.DomUtil.create("div", "leaflet-gac-container leaflet-bar")
      var searchWrapper = L.DomUtil.create("div", "leaflet-gac-wrapper")
      this.searchBox = L.DomUtil.create("input", "leaflet-gac-control")

      // if collapse mode set - create icon and register events
      if (this.options.collapsed_mode) {
        this.collapsedModeIsExpanded = false

        this.icon = L.DomUtil.create("div", "leaflet-gac-search-btn")
        L.DomEvent.on(this.icon, "click", this._showSearchBar, this)

        this.icon.appendChild(L.DomUtil.create("div", "leaflet-gac-search-icon"))
        searchWrapper.appendChild(this.icon)
        L.DomUtil.addClass(this.searchBox, "leaflet-gac-hidden")
      }

      searchWrapper.appendChild(this.searchBox)

      // create and bind autocomplete
      this.container.appendChild(searchWrapper)

    },

    //***
    // Collapse mode callbacks
    //***

    _showSearchBar: function() {
      this._toggleSearch(true)
    },

    _hideSearchBar: function() {
      // if element is expanded, we need to change expanded flag and call collapse handler
      if (this.collapsedModeIsExpanded) {
        this._toggleSearch(false)
      }
    },

    _toggleSearch: function(shouldDisplaySearch) {
      if (shouldDisplaySearch) {
        L.DomUtil.removeClass(this.searchBox, "leaflet-gac-hidden")
        L.DomUtil.addClass(this.icon, "leaflet-gac-hidden")
        this.searchBox.focus()
      } else {
        L.DomUtil.addClass(this.searchBox, "leaflet-gac-hidden")
        L.DomUtil.removeClass(this.icon, "leaflet-gac-hidden")
      }
      this.collapsedModeIsExpanded = shouldDisplaySearch
    },

    //***
    // Default success callback
    //***
    onLocationComplete: function(place, map) {
      // default callback
      if (!place.geometry) {
        alert("Location not found")
        return
      }
      map.panTo([
        place.geometry.location.lat(),
        place.geometry.location.lng()
      ])
    },

    onAdd: function() {
      // stop propagation of click events
      L.DomEvent.addListener(this.container, 'click', L.DomEvent.stop)
      L.DomEvent.disableClickPropagation(this.container)
      if (this.options.collapsed_mode) {
        // if collapse mode - register handler
        this._map.on('dragstart click', this._hideSearchBar, this)
      }
      return this.container
    },

    addTo: function(map) {
      var entered = false;
      this._map = map

      var container = this._container = this.onAdd(map),
        pos = this.options.position,
        corner = map._controlCorners[pos]

      L.DomUtil.addClass(container, 'leaflet-control')
      if (this.options.prepend) {
        corner.insertBefore(container, corner.firstChild)
      } else {
        corner.appendChild(container)
      }

      L.DomEvent.addListener(this.searchBox, 'keyup', function() {
        if (entered) return
        entered = true;
        AC();
      })

      return this
    }
  })

  function showResults(data, _this) {
    console.log(data, _this.container)
  }

  var buildingCodes = {
    'F': 'BUILDING FULLY ACCESSIBLE',
    'A': 'ALTERNATE ENTRANCE',
    'B': 'BUILDING SUBSTANTIALLY ACCESSIBLE',
    'R': 'ACCESSIBLE WITH RAMP',
    'M': 'BUILDING ACCESSIBLITY MODIFIED',
    'N': 'BUILDING NOT ACCESSIBLE'
  }
  var parkingCodes = {
    'N': 'NO PARKING',
    'L': 'LOADING ZONE',
    'H': 'HANDICAP PARKING',
    'G': 'GENERAL PARKING'
  }

  function AC() {
    $('input.leaflet-gac-control').autocomplete({
      minLength: 3,
      source: function(request, callback) {
        var address = encodeURIComponent(request.term),
          url = ('//apis.philadelphiavotes.com/autocomplete/{address}').replace('{address}', address)
        $.getJSON(url, function(response) {
          if (response.status == "success") {
            var addresses = $.map(response.data, function(candidate) {
              return {
                label: candidate.address,
                value: candidate.address,
                precinct: candidate.precinct,
                zip: candidate.zip
              }
            })
            callback(addresses)
          } else {
            callback([])
          }
        })
      },
      select: function(evt, ui) {
        var precinct = encodeURIComponent(ui.item.precinct),
          pollingPlaceUrl = ('//apis.philadelphiavotes.com/pollingplaces/{precinct}').replace('{precinct}', precinct),
          address = encodeURIComponent(ui.item.label),
          geocodeUrl = ('//api.phila.gov/ais/v1/search/{address}/?gatekeeperKey={key}').replace('{address}', address).replace('{key}', 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d')
          // Get everything
        $.when($.getJSON(geocodeUrl), $.getJSON(pollingPlaceUrl)).done(function(addressResult, pollingplaceResult) {
          // render everything
          console.log(addressResult[0].features[0].geometry.coordinates, [pollingplaceResult[0].features.attributes[0].lng, pollingplaceResult[0].features.attributes[0].lat])

        })
      }
    })
  }
})(window.jQuery)


/*   geocoder: {
      // forward: {
        // direction: 'forward',
      url: function (input) {
        var inputEncoded = encodeURIComponent(input);
        return '//api.phila.gov/ais/v1/search/' + inputEncoded;
      },
      params: {
        gatekeeperKey: GATEKEEPER_KEY,
        include_units: true
      }

            selected = response.features[0].attributes;
            selected.building = buildingCodes[selected.building];
            selected.parking = parkingCodes[selected.parking];
            console.log(response.features[0].attributes)

*/