from collections import defaultdict
from flask import Flask, redirect, jsonify, request
from core.resolve_debts import resolve_debt

app = Flask(__name__, static_url_path='/static', static_folder='./static')


@app.route('/optimize', methods=['POST'])
def optimize():
    in_txs = request.json
    ledger = defaultdict(lambda: dict())
    for in_tx in in_txs:
        creditor = in_tx['creditor']
        debtor = in_tx['debtor']
        amount = in_tx['amount']
        ledger[debtor][creditor] = amount
        ledger[creditor]
    ledger = dict(ledger)
    resolved_graph = resolve_debt(ledger)
    out_txs = []
    for debtor, creditor, data in resolved_graph.edges_iter(data=True):
        out_tx = dict(
            debtor=debtor,
            creditor=creditor,
            amount=data['amount'] / 100
        )
        out_txs.append(out_tx)
    return jsonify(transactions=out_txs)


@app.route('/')
def index():
    return redirect('/static/index.html')
