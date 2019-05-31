"""
Find Me Beer.

A small proxy server for sending API request to BreweryDB. Needed
in order to get around the same-origin rule as the API doesn't support CORS.
"""
import os
import json

import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_URL = 'https://sandbox-api.brewerydb.com/v2/'
API_KEY = '57c867fabb0e35e3540fe6119f029846'


@app.route('/', methods=('GET',))
def index():
    """Homepage."""
    return render_template('index.html')


@app.route('/proxy', methods=('POST', 'GET'))
def get_locations():
    """Endpoint for AJAX calls to BreweryDB API."""
    data = request.get_json(force=True)
    url = BASE_URL + data['endpoint']
    payload = {
        'key': data['key'],
        'lat': data['lat'],
        'lng': data['lng'],
        'radius': data.get('radius', 10)
    }
    r = requests.get(url, params=payload)
    return jsonify(r.json())


@app.route('/reno', methods=('POST', 'GET'))
def get_reno_data():
    """Retrieve dummy JSON data for Reno breweries."""
    filename = os.path.join(app.static_folder, 'data/reno.json')
    with open(filename) as f:
        data = json.load(f)
    from pprint import pprint
    pprint(data)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
