function AC(searchBox) {
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
    searchBox.autocomplete({
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
          var address = addressResult[0].features[0].geometry.coordinates,
            pollingPlace = [pollingplaceResult[0].features.attributes[0].lng, pollingplaceResult[0].features.attributes[0].lat]

        })
      }
    })
  }