# Find Me Beer
A brewery locator app powered by KnockoutJS, BreweryDb, and Google Maps

---
### Live App Discontinued

As of 11/2/18, BreweryDB has removed its free API service. For now, FindMeBeer will remain online for reference, but it will not function correctly.

To see what a proper response looks like, please search "Reno, NV." I pulled down the response data for this request and stored it locally. This is the only request which will work every time, but searching some others may work as well depending on what data BreweryDB makes available to their free-tier users.

---

### Setup
1. `git clone https://github.com/mattdavis1121/find-me-beer.git && cd find-me-beer`
2. `mkvirtualenv beer`
3. `pip install -r requirements.txt`
4. Create Google Maps API key and replace in index.html
5. Create BreweryDB API key and replace in app.js
6. `python server.py`

### Flask Proxy Server
BreweryDB does not support Cross-Origin Resource Sharing (CORS), so API calls cannot be made on the client
side. To get around this problem, we run a very small Flask server for sending proxy API calls. Client side
API calls are sent to the proxy server, which forwards on to BreweryDB. Incoming data follows the same
process in reverse.
