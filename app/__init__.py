from flask import Flask, send_file

app = Flask(__name__, static_url_path='/static', static_folder='./static')

from app import api


@app.route('/')
def index():
    return send_file('./static/index.html')
