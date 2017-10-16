function AC(searchBox, lCallback) {
  //document.getElementById('lmap').style.zIndex = 1

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
    $(searchBox).autocomplete({
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
        lCallback(ui.item.lable, ui.item.precinct)
      }
    })
  }