function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.04443758460856, lng: -94.8779296875},
        zoom: 4
    });

    mapBounds = new google.maps.LatLngBounds();
    geo = new google.maps.Geocoder();
}

function makeMarker(breweryModel) {
    var marker = new google.maps.Marker({
        // map: map,
        position: breweryModel.coords(),
        title: breweryModel.name(),
        animation: google.maps.Animation.DROP,
        icon: '../static/img/dark-green-marker-med.png'
    });
    marker.addListener('click', function () {
        console.log(this.breweryObj.viewModel.locationClick(this.breweryObj));
    });
    mapBounds.extend(marker.position);
    map.fitBounds(mapBounds);
    return marker;
}

function geoLocate() {
    // This is unused, but I'm leaving it here. Probably important functionality
    // if I ever come back to the project.
    var input = document.getElementById('address-input');
    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            map.setZoom(14);

            // Get address from current latlng and set search box
            geo.geocode({'location': pos}, function (results, status) {
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

        }, function () {
            handleLocationError();
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError();
    }


    function handleLocationError() {
        // TODO
        console.log("Browser does not support Geolocation")
    }
}
