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

var ViewModel = function () {
    var self = this;

    // KO vars here
    this.locationsList = ko.observableArray([]);
    this.addressSearch = ko.observable();


    this.recenterMap = function(clickedLocation) {
        setMapCenter(new google.maps.Marker({position: clickedLocation.coords()}));
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
