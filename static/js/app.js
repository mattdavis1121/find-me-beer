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

var Brewery = function (data, viewModel) {
    var self = this;

    // id will be used to ensure breweries stored
    // in memory are unique.
    this.id = ko.observable('brewery_' + data.id);

    // Various desriptors
    this.name = ko.observable(data.brewery.name);
    this.description = ko.observable(data.brewery.description);
    this.established = ko.observable(data.brewery.established);
    this.type = ko.observable(data.locationTypeDisplay);

    // Location data
    this.lat = ko.observable(data.latitude);
    this.lng = ko.observable(data.longitude);
    this.distance = ko.observable(data.distance);
    this.coords = ko.computed(function () {
        return {lat: self.lat(), lng: self.lng()};
    });
    this.directionsLink = ko.computed(function () {
        return "https://www.google.com/maps/dir//" + self.lat() + "," + self.lng() + "/"
    });

    this.phone = ko.observable(data.phone);
    this.locality = ko.observable(data.locality);
    this.region = ko.observable(data.region);
    this.streetAddress = ko.observable(data.streetAddress);
    this.postalCode = ko.observable(data.postalCode);
    this.fullAddress = ko.computed(function () {
        return self.streetAddress() + ', ' + self.locality() + ', ' + self.region() + ' ' + self.postalCode();
    });
    this.website = ko.observable(data.website);

    // Images is an object containing various sizes of
    // logos for the brewery. Common structure is...
        // {icon: url, medium: url, large: url,
        //  squareMedium: url, squareLarge: url}
    // but none of these keys can be assumed to be present
    // as not all breweries have logos.
    this.images = ko.observable(data.brewery.images);

    // Track last-clicked location
    this.isActive = ko.observable(false);

    // Store an unshown marker for each brewery,
    // then just toggle visible/hidden.
    //
    // Rubric says markers can't be obvserables, so this is a plain object
    this.marker = makeMarker(this);
    this.marker.breweryObj = this;

    this.viewModel = viewModel;
};

var ViewModel = function () {
    var self = this;

    // KO vars here
    this.locationsList = ko.observableArray([]);
    this.filteredLocationsList = ko.observableArray([]);
    this.addressSearch = ko.observable("Reno, Nevada");
    this.currentLocation = ko.observable();
    this.drawerVisible = ko.observable(false);
    this.typeFilter = ko.observable();
    this.distanceFilter = ko.observable();
    this.distanceOptions = ko.observableArray([20, 10, 5]);
    this.breweriesAreDisplayed = ko.observable(false);

    // Computed vals
    this.breweryTypes = ko.computed(function () {
        var types = [];
        self.locationsList().forEach(function(location) {
           if (!types.includes(location.type())) {
               types.push(location.type());
           };
        });
        return types;
    });
    this.displayBreweries = ko.computed(function() {
        // Handle brewery-type and distance filters
        // If neither filter is set, return locationsList unchanged.
        // If only one of the two is set, apply the appropriate filter and return
        // If both are set, apply both and return
        if (!self.typeFilter() && !self.distanceFilter()) {
            return self.locationsList();
        } else if (self.typeFilter() && !self.distanceFilter()) {
            return ko.utils.arrayFilter(self.locationsList(), function(location) {
                return location.type() == self.typeFilter();
            });
        } else if (!self.typeFilter() && self.distanceFilter()) {
            return ko.utils.arrayFilter(self.locationsList(), function(location) {
                return location.distance() <= self.distanceFilter();
            });
        } else {
            return ko.utils.arrayFilter(self.locationsList(), function(location) {
                return location.type() == self.typeFilter() && location.distance() <= self.distanceFilter();
            });
        };
    });
    this.displayBreweries.subscribe(function(newArray) {
        if (newArray.length > 0) {
            self.locationClick(newArray[0]);
            self.renderMarkers(newArray);
        };
    });

    this.renderMarkers = function(breweriesArray) {
        // Unset all map markers, then render only those in the array passed in
        self.locationsList().forEach(function (brewery) { brewery.marker.setMap(null) });
        breweriesArray.forEach(function (brewery) { brewery.marker.setMap(map) });
    };

    this.recenterMap = function(clickedLocation) {
        setMapCenter(new google.maps.Marker({position: clickedLocation.coords()}));
    };

    this.scrollBreweryIntoView = function(clickedLocation) {
        try {
            var brewery = $('#'+clickedLocation.id());
            var first_brewery = $('.breweries > .brewery');
            var breweries = $('.breweries');
            // Top-to-bottom scroll for desktop view
            breweries.animate({scrollTop:brewery.offset().top - first_brewery.offset().top}, 1000)
            // Left-to-right scroll for mobile
            breweries.animate({scrollLeft:brewery.offset().left - first_brewery.offset().left}, 1000)
        }
        catch(err) {
            // Do nothing. This is just to prevent an error when calling
            // the locationClick function on address search.
        }
    };

    this.locationClick = function(clickedLocation) {

        self.scrollBreweryIntoView(clickedLocation);

        // First, reset last-clicked marker to default
        if (self.currentLocation()) {
            self.currentLocation().marker.setIcon('../static/img/dark-green-marker-med.png');
            self.currentLocation().marker.setZIndex();
            self.currentLocation().isActive(false);
        };

        // Then register new currentLocation and use custom marker
        clickedLocation.marker.setIcon('../static/img/light-green-marker-med2.png');
        clickedLocation.marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
        clickedLocation.isActive(true);
        self.currentLocation(clickedLocation);
    };

    this.toggleDrawer = function(clickedMarker) {
        self.drawerVisible(!self.drawerVisible());
    };

    this.getNearbyBreweries = function(position) {
        var data = {
            lat: position.lat(),
            lng: position.lng(),
            radius: 30,
            key: '57c867fabb0e35e3540fe6119f029846',
            endpoint: '/search/geo/point'
        };

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "/proxy",
            data: JSON.stringify(data),
            success: function(breweryJSON) {
                console.log(breweryJSON);
                var breweries = [];
                breweryJSON.data.forEach(function(breweryData) {
                    var brewery = new Brewery(breweryData, self);
                    breweries.push(brewery);
                });
                self.locationsList(breweries);
            }
        });
    };

    this.resetLocationsList = function() {
        // Remove all current markers from map, reset map bounds, and empty observableArray
        self.locationsList().forEach(function(location) {
            location.marker.setMap(null);
        });
        mapBounds = new google.maps.LatLngBounds();
        self.locationsList([]);
    };

    this.searchLocation = function () {
        self.drawerVisible(false);
        self.resetLocationsList();
        geo.geocode({'address': self.addressSearch()}, function(results, status) {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                map.setZoom(14);
                self.getNearbyBreweries(results[0].geometry.location);
                self.addressSearch('');
            } else {
                alert('Geocode was not successful for the following reason: ' + status)
            };
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
