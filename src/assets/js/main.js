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

                // let's not run until we've entered a street number
                // and the first letter of the street
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
            //ds.coordinates = coordsSwap(ds.coordinates)
            //ds.marker = L.polygon(ds.coordinates, ds.style).addTo(lmap)
            console.log(ds.coordinates)
            ds.shape = L.geoJSON({
                type: "Feature",
                properties: {
                    name: ds.name
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [-75.18593893297532, 40.01490502099166],
                        [-75.18480491525104, 40.013924205629905],
                        [-75.18451730570843, 40.013683826576546],
                        [-75.18416991809201, 40.01337819877329],
                        [-75.18233925556574, 40.01177099354308],
                        [-75.18224161580842, 40.011685269272526],
                        [-75.18213065189069, 40.01158784644552],
                        [-75.18033836469951, 40.00962034685711],
                        [-75.18014890725196, 40.009260291209856],
                        [-75.17998485111355, 40.008816194454184],
                        [-75.17970192253023, 40.00792900983181],
                        [-75.17969396029291, 40.00790730013591],
                        [-75.17986302587553, 40.00795501824415],
                        [-75.18018436717604, 40.008045724205665],
                        [-75.1805057043114, 40.008136438165394],
                        [-75.1808270384524, 40.00822716014956],
                        [-75.18114836839447, 40.00831789103215],
                        [-75.18146969410364, 40.008408631713635],
                        [-75.18179101434119, 40.00849938396825],
                        [-75.18211233031205, 40.008590146921954],
                        [-75.18244636636521, 40.00868449201725],
                        [-75.18276768924724, 40.008775240637966],
                        [-75.1830890154997, 40.00886598391041],
                        [-75.18341034395173, 40.00895672180838],
                        [-75.18373167574009, 40.00904745525829],
                        [-75.1840530097279, 40.00913818333376],
                        [-75.18437434701788, 40.00922890786137],
                        [-75.1846956864732, 40.00931962791466],
                        [-75.18501702926459, 40.00941034351985],
                        [-75.18533837301655, 40.00950105552481],
                        [-75.1854140624469, 40.00952242066434],
                        [-75.18565972010448, 40.009591763081616],
                        [-75.18598106815291, 40.00968246703817],
                        [-75.18630241946916, 40.009773168346996],
                        [-75.18654047954062, 40.009840357872484],
                        [-75.18662377174586, 40.00986386605557],
                        [-75.1867561469738, 40.00990122555787],
                        [-75.18721187490104, 40.01021114627796],
                        [-75.18792737697834, 40.0108057214176],
                        [-75.18639671456947, 40.01153318663397],
                        [-75.18637076367602, 40.0116371385525],
                        [-75.18616979128001, 40.01196560686416],
                        [-75.18601399139507, 40.0121212178807],
                        [-75.18635386796167, 40.01239958536763],
                        [-75.1866348265639, 40.01265736566291],
                        [-75.18687712335922, 40.01286080644587],
                        [-75.18740435588927, 40.01331237023977],
                        [-75.18777298588155, 40.013632328482856],
                        [-75.1872035528373, 40.01402192354383],
                        [-75.18666249511467, 40.01438992423518],
                        [-75.18593893297532, 40.01490502099166]
                    ]
                }
            }, {
                style: ds.style
            })

            ds.shape.addTo(lmap)

            //ds.marker = L.polygon(ds.coordinates, ds.style).bindTooltip(ds.name, {
            //    permanant: true,
            //    className: "polygon-labels",
            //    offset: [0, 0]
            //}).addTo(lmap).openTooltip()

            // save data
            vars.home = h
            vars.pollingPlace = pp

            vars.indexes = idx

            // draw info display
            $('#panel').html(
                /*              '<div id="accordion">' + 
                              '  <h3 >Polling Place</h3>' +
                              '  <p>' +
                              '    <div>' + pp.data.location + '</div>' +
                              '    <div>' + pp.data.display_address + '</div>' +
                              '    <div>' + buildingCodes[pp.data.building] + ' | ' + parkingCodes[pp.data.parking] + '</div>' +
                              '  </p>' + 
                              '  <h3 >Something Else</h3>' +
                              '  <p>' +
                              '    <div>Other stuff</div>' +
                              '  </p>' +
                              '  <h3 >Something Else</h3>' +
                              '  <p>' +
                              '    <div>Other stuff</div>' +
                              '  </p>' +
                              '  <h3 >Something Else</h3>' +
                              '  <p>' +
                              '    <div>Other stuff</div>' +
                              '  </p>' +
                              '</div>'*/

                '<div id="accordion">' +
                '  <h3>Polling Place</h3>' +
                '  <div>' +
                '    <ul>' +
                '      <li>' + pp.data.location + '</li>' +
                '      <li>' + pp.data.display_address + '</li>' +
                '      <li>' + buildingCodes[pp.data.building] + '</li>' +
                '      <li>' + parkingCodes[pp.data.parking] + '</li>' +
                '    </ul>' +
                '  </div>' +
                '  <h3>Sample Ballot</h3>' +
                '  <div>' +
                '    <p>Sed non urna. Phasellus eu ligula. Vestibulum sit amet purus.' +
                '    Vivamus hendrerit, dolor aliquet laoreet, mauris turpis velit,' +
                '    faucibus interdum tellus libero ac justo.</p>' +
                '  </div>' +
                '  <h3>Elected Officials</h3>' +
                '  <div>' +
                '    <p>Nam enim risus, molestie et, porta ac, aliquam ac, risus.' +
                '    Quisque lobortis.Phasellus pellentesque purus in massa.</p>' +
                '    <ul>' +
                '      <li>List item one</li>' +
                '      <li>List item two</li>' +
                '      <li>List item three</li>' +
                '    </ul>' +
                '  </div>' +
                '</div>')
            $("#accordion").accordion();
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
                        color: "#FF0000",
                    },
                    data: response.features[0].properties,
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