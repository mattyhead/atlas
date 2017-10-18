(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function($, L, W, D) {
    //'use strict'
    var lmap, markers, vars = {}
        // later 
    $(function() {
            document.getElementById('lmap').style.zIndex = 1
            lmap = L.map('lmap').setView(CITY_HALL, ZOOM)
                // set up layers
            L.esri.tiledMapLayer({
                url: BASEMAP
            }).addTo(lmap)
            L.esri.tiledMapLayer({
                    url: BASEMAP_LABELS
                }).addTo(lmap)
                // add our SearchBox and set service
            new L.Control.SearchBox().addTo(lmap).setService(addressComplete)
        })
        // now 
    var GATEKEEPER_KEY = 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d',
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
            })
        },
        buildingCodes = {
            'F': 'BUILDING FULLY ACCESSIBLE',
            'A': 'ALTERNATE ENTRANCE',
            'B': 'BUILDING SUBSTANTIALLY ACCESSIBLE',
            'R': 'ACCESSIBLE WITH RAMP',
            'M': 'BUILDING ACCESSIBLITY MODIFIED',
            'N': 'BUILDING NOT ACCESSIBLE'
        },
        parkingCodes = {
            'N': 'NO PARKING',
            'L': 'LOADING ZONE',
            'H': 'HANDICAP PARKING',
            'G': 'GENERAL PARKING'
        },
        services = {
            'address_completer': {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//apis.philadelphiavotes.com/autocomplete/{encInput}'.replace('{encInput}', encInput)
                }
            },
            'geocoder': {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//api.phila.gov/ais/v1/search/{encInput}'.replace('{encInput}', encInput)
                },
                'params': {
                    'gatekeeperKey': GATEKEEPER_KEY
                },
                'resolve': '{ coordinates: [response.features[0].geometry.coordinates[1], response.features[0].geometry.coordinates[0]], style: { color: "#FF0000" }, name: input }'
            },
            'indexes': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//www.philadelphiavotes.com/index.php?option=com_divisions&view=json&division_id={encInput}'.replace('{encInput}', encInput)
                },
                'resolve': 'response.features[0].attributes'
            },
            'polling_place': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//apis.philadelphiavotes.com/pollingplaces/{encInput}'.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: [response.features.attributes[0].lat, response.features.attributes[0].lng], style: { color: "#FF0000" }, name: input }'
            },
            'division_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/22/query?f=pjson&callback=?&outSR=4326&where=DIVISION_NUM=\'{encInput}\''.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#00FF00" }, name: input }'
            },
            // ward service - single quotes
            'ward_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/21/query?f=pjson&callback=?&outSR=4326&where=WARD_NUM=\'{encInput}\''.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#0000FF" }, name: input }'
            },
            // council service - single quotes
            'council_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/3/query?f=pjson&callback=?&outSR=4326&where=DISTRICT=\'{encInput}\''.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#0D912E" }, name: input }'
            },
            // state rep service - single quotes
            'state_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/25/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER=\'{encInput}\''.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#751675" }, name: input }'
            },
            // state sen service - no single quotes
            'state_sen_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/24/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#875010" }, name: input }'
            },
            'us_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//maps1.arcgisonline.com/ArcGIS/rest/services/USA_Congressional_Districts/MapServer/2/query?f=pjson&callback=?&where=DISTRICTID=42{encInput}'.replace('{encInput}', encInput)
                },
                'resolve': '{ coordinates: response.features[0].geometry.rings[0], style: { color: "#0C727D" }, name: parseInt(input).toString() }'
            }
        }

    function addressComplete(searchBox) {
        $(searchBox).autocomplete({
            minLength: 3,
            source: function(request, callback) {
                var url = services.address_completer.url(request.term),
                    space = request.term.indexOf(' ')
                if (space > 0 && space < request.term.length - 1) {
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
                }
            },
            select: function(evt, ui) {
                onHomeAddress({
                    'home': ui.item.label,
                    'precinct': ui.item.precinct
                })
            }
        })
    }

    function clearMarkers(marker) {
        // hey, we're clearing all the markers
        if (marker) {
            // clear only one
        } else {
            // clear all
        }
    }

    function onHomeAddress(selected) {
        // independant services
        var
            indexer = new getService(selected.precinct, services.indexes),
            home = new getService(selected.home, services.geocoder),
            pollingPlace = new getService(selected.precinct, services.polling_place),
            divisionShape = new getService(selected.precinct, services.division_shape)

        $.when(home, pollingPlace, divisionShape).then(function(h, pp, ds) {
            console.log('home', h, 'pollingplace', pp, 'divisionshape', ds, lmap)

            // save data
            vars.home = h
            vars.pollingPlace = pp
            vars.divisionShape = ds

            // draw markers
            h.marker = L.marker(h.coordinates, {
                icon: ICONS.home,
            }).addTo(lmap)

            pp.marker = L.marker(pp.coordinates, {
                icon: ICONS.polling
            }).addTo(lmap)

            ds.marker = L.polygon(ds.coordinates, ds.style).addTo(lmap)

            console.log(ds.marker)
            var group = new L.featureGroup([pp.marker, h.marker, ds.marker])
            lmap.fitBounds(group.getBounds())


            // draw info display
        })

        /*       indexer.done(function(indexes) {
            // run dependent services
            var
                wardShape = getWardShape(indexes.ward),
                councilShape = getCouncilShape(indexes.council_district),
                stateSenShape = getStateSenateShape(indexes.state_senate_district),
                stateRepShape = getStateRepShape(indexes.state_representative_district),
                usCongressShape = getUsCongressShape(indexes.congressional_district)

            wardShape.done(function(data) {
                console.log('wardShape', data)

                // save data
                vars.wardShape = data

                // draw markers

                // draw info display

            })
            councilShape.done(function(data) {
                console.log('councilShape', data)

                // save data
                vars.councilShape = data

                // draw markers

                // draw info display

            })
            stateSenShape.done(function(data) {
                console.log('stateSenShape', data)

                // save data
                vars.stateSenShape = data

                // draw markers

                // draw info display

            })
            stateRepShape.done(function(data) {
                console.log('stateRepShape', data)

                // save data
                vars.stateRepShape = data

                // draw markers

                // draw info display

            })
            usCongressShape.done(function(data) {
                console.log('usCongressShape', data)

                // save data
                vars.usCongressShape = data

                // draw markers

                // draw info display

            })

        })
*/
    }

    function getService(input, service) {
        var deferred = $.Deferred()
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve(service.resolve)
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getIndexes(input) {
        var deferred = $.Deferred(),
            service = services.indexes
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve(response.features[0].attributes)
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getHome(input) {
        var deferred = $.Deferred(),
            service = services.geocoder
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve()
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getPollingPlace(input) {
        var deferred = $.Deferred(),
            service = services.polling_place
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                var attrs = response.features.attributes[0]
                deferred.resolve({
                    coordinates: [attrs.lat, attrs.lng],
                    style: {
                        color: "#FF0000"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getDivisionShape(input) {
        var deferred = $.Deferred(),
            service = services.division_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                var rings = response.features[0].geometry.rings[0],
                    tmp = [],
                    elem = []
                for (var i = 0; i < rings.length - 1; i++) {
                    tmp.push([rings[i][1], rings[i][0]])
                }
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#00FF00"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getWardShape(input) {
        var deferred = $.Deferred(),
            service = services.ward_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#0000FF"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getCouncilShape(input) {
        var deferred = $.Deferred(),
            service = services.council_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#0D912E"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getStateRepShape(input) {
        var deferred = $.Deferred(),
            service = services.state_rep_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#751675"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getStateSenateShape(input) {
        var deferred = $.Deferred(),
            service = services.state_sen_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#875010"
                    },
                    name: input
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function getUsCongressShape(input) {
        var deferred = $.Deferred(),
            service = services.us_rep_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
                    style: {
                        color: "#0C727D"
                    },
                    name: parseInt(input).toString()
                })
            } else {
                deferred.reject()
            }
        })
        return deferred.promise()
    }

    function pad(n, width, z) {
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

}))
/*

        getDivisionShape(wardDivision).done(function(A) {
            drawMap([ {
                name: A.name,
                coordinates: A.coordinates
            } ])
            y("DIVISION")
        })
        getWardShape(v).done(function(A) {
            wardData = A
            y("WARD")
        })
        getCouncilShape(z.councilDistrict).done(function(A) {
            councilData = A
            y("COUNCIL")
        })
        getStateRepShape(z.stateRepresentativeDistrict).done(function(A) {
            stateRepData = A
            y("STATE_REP")
        })
        getStateSenateShape(z.stateSenateDistrict).done(function(A) {
            stateSenateData = A
            y("STATE_SENATE")
        })
        getUsCongressShape(z.congressionalDistrict).done(function(A) {
            usCongressData = A
            y("US_CONGRESS")
        })

geocoder: {
  // methods: {
  forward: {
    url(input) {
      const inputEncoded = encodeURIComponent(input)
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