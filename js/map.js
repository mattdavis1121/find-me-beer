function initMap() {
    // TODO: use a constructor to create a new map JS object. You can use the coordinates
    // we used, 40.7413549, -73.99802439999996 or your own!
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.527705, lng: -119.877138},
        zoom: 18
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

    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            map.setZoom(17);

            // Get address from current latlng and set search box
            geo.geocode({'location': pos}, function(results, status) {
                if (status === 'OK') {
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
            input.value
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
};

function setMapCenter(location) {
    var preZoom = map.getZoom();
    while (!map.getBounds().contains(location.getPosition())) {
        map.setZoom(map.getZoom() - 1);
    };
    map.panTo(location.getPosition());
    map.setZoom(preZoom);
};

function initMarker(locationModel) {
    var marker = new google.maps.Marker({
        map: map,
        position: locationModel.coords(),
        title: locationModel.title(),
        animation: google.maps.Animation.DROP
    });
    mapBounds.extend(marker.position);
}

function codeAddress() {
    var address = document.getElementById('address').value;
    geo.geocode({'address': address}, function(results, status) {
        console.log(results);
        setMapCenter(new google.maps.Marker({position: results[0].geometry.location}));
    });
}
