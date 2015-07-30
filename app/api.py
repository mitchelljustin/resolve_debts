from flask import jsonify, request

from app import app
from core.resolve_debts import resolve_debt, build_ledger_from_transactions, build_transactions_from_ledger


@app.route('/optimize', methods=['POST'])
def optimize():
    in_txs = request.json
    in_txs = [
        tx for tx in in_txs if
        len(tx['creditor']) != 0 and
        len(tx['debtor']) != 0 and
        len(tx['amount']) != 0
    ]
    ledger = build_ledger_from_transactions(in_txs)
    resolved_ledger = resolve_debt(ledger)
    out_txs = build_transactions_from_ledger(resolved_ledger)
    return jsonify(transactions=out_txs)
