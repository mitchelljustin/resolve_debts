from flask import Flask, jsonify, request, send_file

from core.resolve_debts import resolve_debt, build_ledger_from_transactions, build_transactions_from_ledger

app = Flask(__name__, static_url_path='/static', static_folder='./static')


@app.route('/optimize', methods=['POST'])
def optimize():
    in_txs = request.json
    ledger = build_ledger_from_transactions(in_txs)
    resolved_ledger = resolve_debt(ledger)
    out_txs = build_transactions_from_ledger(resolved_ledger)
    return jsonify(transactions=out_txs)


@app.route('/')
def index():
    return send_file('./static/index.html')
