import requests

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_URL = 'http://api.brewerydb.com/v2'
API_KEY = '57c867fabb0e35e3540fe6119f029846'

@app.route('/', methods=('GET',))
def index():
    return render_template('index.html')

@app.route('/proxy', methods=('POST','GET'))
def get_locations():
    data = request.get_json(force=True)
    url = BASE_URL + data['endpoint']
    payload = {
        'key': data['key'],
        'lat': data['lat'],
        'lng': data['lng']
    }
    r = requests.get(url, params=payload)
    return jsonify(r.json())

if __name__ == '__main__':
    app.run(debug=True, port=2000)
