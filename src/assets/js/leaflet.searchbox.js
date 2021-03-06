(function() {
  L.SearchBox = {}

  L.Control.SearchBox = L.Control.extend({
    options: {
      position: "topright",
      prepend: true,
      collapsed_mode: false
    },
    collapsedModeIsExpanded: true,
    icon: null,
    searchBox: null,
    callback: null,
    service: null,

    initialize: function(options) {
      if (options) {
        L.Util.setOptions(this, options)
      }
      this._buildContainer()
    },

    setCallback: function(func) {
      if (typeof func == "function")
        this.callback = func
      return this
    },

    setService: function(func) {
      if (typeof func == "function")
        this.service = func
      return this
    },

    _buildContainer: function() {
      // build structure
      this.container = L.DomUtil.create("div", "leaflet-sb-container leaflet-bar")
      var searchWrapper = L.DomUtil.create("div", "leaflet-sb-wrapper")
      this.searchBox = L.DomUtil.create("input", "leaflet-sb-control")

      // if collapse mode set - create icon and register events
      if (this.options.collapsed_mode) {
        this.collapsedModeIsExpanded = false

        this.icon = L.DomUtil.create("div", "leaflet-sb-search-btn")
        L.DomEvent.on(this.icon, "click", this._showSearchBar, this)

        this.icon.appendChild(L.DomUtil.create("div", "leaflet-sb-search-icon"))
        searchWrapper.appendChild(this.icon)
        L.DomUtil.addClass(this.searchBox, "leaflet-sb-hidden")
      }

      searchWrapper.appendChild(this.searchBox)

      // create and bind searchbox
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
        L.DomUtil.removeClass(this.searchBox, "leaflet-sb-hidden")
        L.DomUtil.addClass(this.icon, "leaflet-sb-hidden")
        this.searchBox.focus()
      } else {
        L.DomUtil.addClass(this.searchBox, "leaflet-sb-hidden")
        L.DomUtil.removeClass(this.icon, "leaflet-sb-hidden")
      }
      this.collapsedModeIsExpanded = shouldDisplaySearch
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
      var entered = false,
        that = this
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
      // crude but effective initialization kludge
      L.DomEvent.on(this.searchBox, 'keyup', function() {
        // only want to run this event once.
        if (entered) return
        entered = true
        that.service(this, that.callback)
      })

      return this
    }
  })
})()