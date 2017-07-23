function initMap() {
    // TODO: use a constructor to create a new map JS object. You can use the coordinates
    // we used, 40.7413549, -73.99802439999996 or your own!
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.527705, lng: -119.877138},
        zoom: 18
    });
    mapBounds = new google.maps.LatLngBounds();
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
