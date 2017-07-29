function BreweryDBAPI(APIKey) {
    var self = this;

    this.APIKey = APIKey;
    this.baseUrl = '/proxy'
    this.getNearbyBreweries = function(position) {
        var endpoint = '/search/geo/point'
        var data = {
            lat: position.lat,
            lng: position.lng
        };
        self.callAPI(endpoint, data);
    };
    this.callAPI = function(endpoint, data) {
        // Ensure all API calls include our API key in params
        if (!('key' in data)) {
            data.key = self.APIKey;
        };

        // Same for endpoint
        if (!('endpoint' in data)) {
            data.endpoint = endpoint;
        };

        // Send it
        $.ajax({
            type: "POST",
            dataType: "json",
            url: self.baseUrl,
            data: JSON.stringify(data),
            success: function(locationData) {
                self.callback(locationData);
            }
        });
    };
    this.callback = function(locationData) {
        console.log(locationData);
    }
};
