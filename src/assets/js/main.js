(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function($, L, W, D) {
    //'use strict'
    var lmap, markers = {},
        groups = {},
        vars = {},
        shapes = {}

    // later 
    $(function() {

        // set map lower, for chrissakes
        document.getElementById('lmap').style.zIndex = 1

        // set the map, center on City Hall
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
        ZOOM = 15,
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
                }
            },
            'indexer': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//www.philadelphiavotes.com/index.php?option=com_divisions&view=json&division_id={encInput}'.replace('{encInput}', encInput)
                }
            },
            'polling_place': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//apis.philadelphiavotes.com/pollingplaces/{encInput}'.replace('{encInput}', encInput)
                }
            },
            'division_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input, 4))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/22/query?f=pjson&callback=?&outSR=4326&where=DIVISION_NUM=\'{encInput}\''.replace('{encInput}', encInput)
                }
            },
            // ward service - single quotes
            'ward_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/21/query?f=pjson&callback=?&outSR=4326&where=WARD_NUM=\'{encInput}\''.replace('{encInput}', encInput)
                }
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
                }
            },
            // state sen service - no single quotes
            'state_sen_shape': {
                url(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10))
                    return '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/24/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput)
                }
            },
            'us_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//maps1.arcgisonline.com/ArcGIS/rest/services/USA_Congressional_Districts/MapServer/2/query?f=pjson&callback=?&where=DISTRICTID=42{encInput}'.replace('{encInput}', encInput)
                }
            },
            'new_us_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//apis.philadelphiavotes.com/shapes/us_congress/42{encInput}'.replace('{encInput}', encInput)
                }
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
            indexer = getIndexes(selected.precinct),
            home = getHome(selected.home),
            pollingPlace = getPollingPlace(selected.precinct),
            divisionShape = getDivisionShape(selected.precinct)

        $.when(home, pollingPlace, divisionShape, indexer).then(function(h, pp, ds, idx) {

            // draw markers
            h.marker = L.marker(h.coordinates, {
                icon: ICONS.home,
            }).addTo(lmap)

            pp.marker = L.marker(pp.coordinates, {
                icon: ICONS.polling
            }).addTo(lmap)

            grouper([h.marker, pp.marker])

            // coordinate pairs are lng/lat.  we need lat/lng for leaflet polygons
            ds.coordinates = coordsSwap(ds.coordinates)
            ds.marker = L.polygon(ds.coordinates, ds.style).addTo(lmap)

            //ds.marker = L.polygon(ds.coordinates, ds.style).bindTooltip(ds.name, {
            //    permanant: true,
            //    className: "polygon-labels",
            //    offset: [0, 0]
            //}).addTo(lmap).openTooltip()

            // save data
            vars.home = h
            vars.pollingPlace = pp
            vars.divisionShape = ds
            vars.indexes = idx

            // draw info display

        })

    }

    function getIndexes(input) {
        var deferred = $.Deferred(),
            service = services.indexer
        $.getJSON(service.url(input), service.params).done(function(response) {
            if (response.features) {
                deferred.resolve({
                    data: response.features[0].attributes
                })
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
                deferred.resolve({
                    coordinates: [response.features[0].geometry.coordinates[1], response.features[0].geometry.coordinates[0]],
                    style: {
                        color: "#FF0000"
                    },
                    data: response.features[0],
                    name: input
                })
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
                    data: attrs,
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
                deferred.resolve({
                    coordinates: response.features[0].geometry.rings[0],
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
            service = services.new_us_rep_shape
        $.getJSON(service.url(input), service.params).done(function(response) {
            console.log(response)
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

    function grouper(markers) {
        var group = new L.featureGroup(markers)
        lmap.fitBounds(group.getBounds())
    }

    function coordsSwap(coords) {
        var tmp = []
        for (var i = 0; i < coords.length - 1; i++) {
            tmp.push([coords[i][1], coords[i][0]])
        }
        return tmp
    }

    function pad(n, width, z) {
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

}))