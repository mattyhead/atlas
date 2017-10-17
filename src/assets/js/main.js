(function(scoped) {
    scoped(window.jQuery, window.L, window, document);
}(function($, L, W, D) {
    var lmap, markers = {};
    // later 
    $(function() {
        lmap = L.map('lmap').setView(CITY_HALL, ZOOM);
        // set up layers
        L.esri.tiledMapLayer({
            url: BASEMAP
        }).addTo(lmap);
        L.esri.tiledMapLayer({
            url: BASEMAP_LABELS
        }).addTo(lmap);
        // add our SearchBox and set service
        new L.Control.SearchBox().addTo(lmap).setService(addressComplete)
    });
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
                }
            },
            'divisions': {
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
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/22/query?f=pjson&callback=?&outSR=4326&where=DIVISION_NUM={encInput}'.replace('{encInput}', encInput)
                }
            },
            'ward_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/21/query?f=pjson&callback=?&outSR=4326&where=WARD_NUM={encInput}'.replace('{encInput}', encInput)
                }
            },
            'council_shape': {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/3/query?f=pjson&callback=?&outSR=4326&where=DISTRICT={encInput}'.replace('{encInput}', encInput)
                }
            },
            'state_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/25/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput)
                }
            },
            'state_sen_shape': {
                url(input) {
                    const encInput = encodeURIComponent(input)
                    return '//gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/24/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput)
                }
            },
            'us_rep_shape': {
                url(input) {
                    const encInput = encodeURIComponent(pad(input))
                    return '//maps1.arcgisonline.com/ArcGIS/rest/services/USA_Congressional_Districts/MapServer/2/query?f=pjson&callback=?&where=DISTRICTID=42{encInput}'.replace('{encInput}', encInput)
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
                                };
                            });
                            callback(addresses);
                        } else {
                            callback([]);
                        }
                    });
                }
            },
            select: function(evt, ui) {
                onHomeAddress({
                    'home': ui.item.label,
                    'precinct': ui.item.precinct
                });
            }
        });
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
        console.log('select', selected);
        /*lmap.panTo([
            place.geometry.location.lat(),
            place.geometry.location.lng()
        ])*/
        //        $.when(getStuff(services.geocoder, selected.street), getStuff(services.polling_place, selected.precinct)
        var home = getHome(selected.home)

        home.done(function(data) {
            console.log(data) return
            markers.home = L.marker(address, {
                icon: ICONS.home
            }).addTo(lmap);
        })


        /*        var markers.polling = L.marker(pollingPlace, {
                    icon: ICONS.polling
                }).addTo(lmap);
                markers.home = L.marker(address, {
                    icon: ICONS.home
                }).addTo(lmap);
                var group = new L.featureGroup([markers.home, markers.polling]);
                lmap.fitBounds(group.getBounds());*/
    }

    function getHome(input) {
        var b = $.Deferred(),
            service = services.geocoder
        $.getJSON(service.url(input), service.params).done(function(c) {
            if (c.features) {
                b.resolve({
                    coordinates: c.features[0].geometry.coordinates,
                    color: "#FF0000",
                    name: input
                });
            } else {
                b.reject();
            }
        });
        return b.promise();
    }

    function pad(n, width, z) {
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

}));
/*

        getDivisionShape(wardDivision).done(function(A) {
            drawMap([ {
                name: A.name,
                coordinates: A.coordinates
            } ]);
            y("DIVISION");
        });
        getWardShape(v).done(function(A) {
            wardData = A;
            y("WARD");
        });
        getCouncilShape(z.councilDistrict).done(function(A) {
            councilData = A;
            y("COUNCIL");
        });
        getStateRepShape(z.stateRepresentativeDistrict).done(function(A) {
            stateRepData = A;
            y("STATE_REP");
        });
        getStateSenateShape(z.stateSenateDistrict).done(function(A) {
            stateSenateData = A;
            y("STATE_SENATE");
        });
        getUsCongressShape(z.congressionalDistrict).done(function(A) {
            usCongressData = A;
            y("US_CONGRESS");
        });

    function getHome(a) {
        var b = $.Deferred();
        $.getJSON(('//api.phila.gov/ais/v1/search/{address}/?gatekeeperKey={key}').replace('{address}', a).replace('{key}', encodeURIComponent(KEY)).done(function(c) {
                if (c.features) {
                    b.resolve({
                        coordinates: c.features[0].geometry.rings[0],
                        color: "#FF0000",
                        name: a
                    });
                } else {
                    b.reject();
                }
            });
            return b.promise();
        }
    }

    function getPollingPlace(a) {
        var b = $.Deferred();
        $.getJSON(('//apis.philadelphiavotes.com/pollingplaces/{precinct}').replace('{precinct}', encodeURIComponent(a))).done(function(c) {
            if (c.features) {
                b.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#FF0000",
                    name: a
                });
            } else {
                b.reject();
            }
        });
        return b.promise();
    }

    function getDivisionShape(a) {
        var b = $.Deferred();
        $.getJSON("https://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/22/query?f=pjson&callback=?&outSR=4326&where=DIVISION_NUM='" + a + "'").done(function(c) {
            if (c.features) {
                b.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#FF0000",
                    name: a
                });
            } else {
                b.reject();
            }
        });
        return b.promise();
    }

    function getWardShape(b) {
        var a = $.Deferred();
        b = parseInt(b, 10);
        $.getJSON("https://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/21/query?f=pjson&callback=?&outSR=4326&where=WARD_NUM='" + b + "'").done(function(c) {
            if (c.features) {
                a.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#0000FF",
                    name: b
                });
            } else {
                a.reject();
            }
        });
        return a.promise();
    }

    function getCouncilShape(b) {
        var a = $.Deferred();
        b = parseInt(b, 10);
        $.getJSON("https://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/3/query?f=pjson&callback=?&outSR=4326&where=DISTRICT='" + b + "'").done(function(c) {
            if (c.features) {
                a.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#0D912E",
                    name: b
                });
            } else {
                a.reject();
            }
        });
        return a.promise();
    }

    function getStateRepShape(b) {
        var a = $.Deferred();
        b = parseInt(b, 10);
        $.getJSON("https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/25/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER='" + b + "'").done(function(c) {
            if (c.features) {
                a.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#751675",
                    name: b
                });
            } else {
                a.reject();
            }
        });
        return a.promise();
    }

    function getStateSenateShape(b) {
        var a = $.Deferred();
        b = parseInt(b, 10);
        $.getJSON("https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/24/query?f=pjson&callback=?&outSR=4326&where=DISTRICT_NUMBER=" + b).done(function(c) {
            if (c.features) {
                a.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#875010",
                    name: b
                });
            } else {
                a.reject();
            }
        });
        return a.promise();
    }

    function getUsCongressShape(b) {
        var a = $.Deferred();
        b = parseInt(b, 10);
        if (b < 10) {
            b = "0" + b;
        }
        $.getJSON("https://maps1.arcgisonline.com/ArcGIS/rest/services/USA_Congressional_Districts/MapServer/2/query?f=pjson&callback=?&where=DISTRICTID='42" + b + "'").done(function(c) {
            if (c.features) {
                a.resolve({
                    coordinates: c.features[0].geometry.rings[0],
                    color: "#0C727D",
                    name: parseInt(b).toString()
                });
            } else {
                a.reject();
            }
        });
        return a.promise();
    }

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