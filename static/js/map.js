function initMap() {
    // TODO: use a constructor to create a new map JS object. You can use the coordinates
    // we used, 40.7413549, -73.99802439999996 or your own!
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.04443758460856, lng: -94.8779296875},
        zoom: 4
    });
    mapBounds = new google.maps.LatLngBounds();
    geo = new google.maps.Geocoder();

    // Init and config address search autocomplete
    var input = document.getElementById('address-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    });

    api = new BreweryDBAPI('57c867fabb0e35e3540fe6119f029846')
    pos = {lat: 39.5278099, lng: -119.87703720000002}

};

function setMapCenter(location) {
    var preZoom = map.getZoom();
    while (!map.getBounds().contains(location.getPosition())) {
        map.setZoom(map.getZoom() - 1);
    };
    map.panTo(location.getPosition());
    map.setZoom(preZoom);
};

function initMarker(breweryModel) {
    var marker = new google.maps.Marker({
        map: map,
        position: breweryModel.coords(),
        title: breweryModel.name(),
        animation: google.maps.Animation.DROP
    });
    mapBounds.extend(marker.position);
}

function codeAddress() {
    console.log('running');

    var address = document.getElementById('address-input').value;
    geo.geocode({'address': address}, function(results, status) {
        console.log(results);
        setMapCenter(new google.maps.Marker({position: results[0].geometry.location}));
    });
}

function geoLocate() {
    var input = document.getElementById('address-input');
    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            map.setZoom(14);

            // Get address from current latlng and set search box
            geo.geocode({'location': pos}, function(results, status) {
                if (status === 'OK') {
                    console.log(results);
                    if (results[0]) {
                        // Set search box value to most specific address
                        // returned by reverse geocode. To set to less specific,
                        // use an index on results higher than 0.
                        // Example: results[1] = approx location, and results[2] =
                        // city, state.
                        input.value = results[0].formatted_address;
                    }
                }
            });

        }, function() {
            handleLocationError();
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError();
    };
    function handleLocationError() {
        // TODO
        console.log("Browser does not support Geolocation")
    };
}
