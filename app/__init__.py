from flask import Flask, redirect, jsonify

app = Flask(__name__, static_url_path='/static', static_folder='./static')


@app.route('/optimize', methods=['POST'])
def optimize():
    return jsonify(transactions=[])


@app.route('/')
def index():
    return redirect('/static/index.html')
