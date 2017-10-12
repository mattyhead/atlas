(function() {
  L.Autocomplete = {}

  L.Control.Autocomplete = L.Control.extend({
    options: {
      position: "topright",
      prepend: true,
      collapsed_mode: false,
      autocomplete_options: {}
    },
    collapsedModeIsExpanded: true,
    icon: null,
    searchBox: null,

    initialize: function(options) {
      if (options) {
        L.Util.setOptions(this, options)
      }
      if (!this.options.autocomplete_options.callback) {
        this.options.autocomplete_options.callback = this.onLocationComplete
      }
      if (!this.options.autocomplete_options.minchars) {
        this.options.autocomplete_options.minchars = 3
      }
      if (!this.options.autocomplete_options.url) {
        this.options.autocomplete_options.url = 'https://apis.philadelphiavotes.com/autocomplete/{address}'
      }
      this._buildContainer()
    },

    _buildContainer: function() {
      // build structure
      this.container = L.DomUtil.create("div", "leaflet-gac-container leaflet-bar")
      var searchWrapper = L.DomUtil.create("div", "leaflet-gac-wrapper")
      this.searchBox = L.DomUtil.create("input", "leaflet-gac-control")
        // this.autocomplete = new google.maps.places.Autocomplete(this.searchBox, this.options.autocomplete_options)

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

      var _this = this
      L.DomEvent.addListener(this.searchBox, 'keyup', function() {
        var options = _this.options.autocomplete_options

        // leave if minchars not met
        if (options.minchars > this.value.length) return

        L.Util.ajax(options.url.replace('{address}', encodeURIComponent(this.value))).then(function(data) {
          showResults(data, _this);
        });
      })
      return this
    }
  })

  function showResults(data, _this) {
    console.log(data, _this.container)
  }
})()