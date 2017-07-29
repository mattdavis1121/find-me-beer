var locations = [
    {title: 'Home', location: {lat: 39.527705, lng: -119.877138}},
    {title: 'Aberfeldy', location: {lat: 39.481282, lng: -119.850763}},
    {title: 'Idlewild', location: {lat: 39.518227, lng: -119.839534}},
    {title: 'Apartment', location: {lat: 39.479846, lng: -119.836763}}
];

var Location = function (data) {
    var self = this;

    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);

    this.coords = ko.computed(function () {
        return {lat: self.lat(), lng: self.lng()};
    });
};

var Brewery = function (data) {
    var self = this;

    this.name = ko.observable(data.brewery.name);
    this.lat = ko.observable(data.latitude);
    this.lng = ko.observable(data.longitude);
    this.coords = ko.computed(function () {
        return {lat: self.lat(), lng: self.lng()};
    })
    this.type = ko.observable(data.locationTypeDisplay);
    this.phone = ko.observable(data.phone);
    this.locality = ko.observable(data.locality);
    this.region = ko.observable(data.region);
    this.streetAddress = ko.observable(data.streetAddress);
    this.postalCode = ko.observable(data.postalCode);
    this.fullAddress = ko.computed(function () {
        return self.streetAddress() + ', ' + self.locality() + ', ' + self.region() + ' ' + self.postalCode();
    });
    this.website = ko.observable(data.website);
};

var ViewModel = function () {
    var self = this;

    // KO vars here
    this.locationsList = ko.observableArray([]);
    this.addressSearch = ko.observable();


    this.recenterMap = function(clickedLocation) {
        setMapCenter(new google.maps.Marker({position: clickedLocation.coords()}));
    };

    this.getNearbyBreweries = function(position) {
        var data = {
            lat: position.lat,
            lng: position.lng,
            key: '57c867fabb0e35e3540fe6119f029846',
            endpoint: '/search/geo/point'
        };

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/proxy",
            data: JSON.stringify(data),
            success: function(breweryJSON) {
                breweryJSON.data.forEach(function(breweryData) {
                    var brewery = new Brewery(breweryData);
                    self.locationsList.push(brewery);
                    initMarker(brewery);
                });
            }
        });
    };

    this.currentLocationClick = function() {
        // 1. Get current location
        // 2. Get breweries surrounding current location
        // 3. Recenter map on current location
        // 4. Display breweries on map

        var pos = {}

        // Get current location
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(pos);
            map.setCenter(pos);
            map.setZoom(14);
            self.getNearbyBreweries(pos);

            // Get address from current latlng and set search box
            // geo.geocode({'location': pos}, function(results, status) {
            //     if (status === 'OK') {
            //         if (results[0]) {
            //             // Set search box value to most specific address
            //             // returned by reverse geocode. To set to less specific,
            //             // use an index on results higher than 0.
            //             // Example: results[1] = approx location, and results[2] =
            //             // city, state.
            //             input.value = results[0].formatted_address;
            //         }
            //     }
            // });
        });

        // Get breweries surrounding current location

    };

    this.searchAddress = function(address) {
        // 1. Set map center to location (zoomed out pretty well)
        // 2. Get list of nearby breweries
        // 3. Display

        geo.geocode({'address': address}, function(results, status) {
            console.log(results);
            setMapCenter(new google.maps.Marker({position: results[0].geometry.location}));
        });

        self.recenterMap()
    };

    this.makeDefaultLocations = function() {
        // Create markers and Location models from
        // locations list. Extend map bounds to fit
        // all markers.
        locations.forEach(function(locationData) {
            var location = new Location(locationData);
            self.locationsList.push(location);
            initMarker(location);
        });
        map.fitBounds(mapBounds);
    };

    this.getLocations = function() {

    };
};

initMap();
ko.applyBindings(new ViewModel());
