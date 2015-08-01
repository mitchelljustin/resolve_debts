from collections import defaultdict
from heapq import *

import networkx as nx


def load_ledger_into_graph(graph, ledger):
    all_keys = set()
    all_keys.update(ledger.keys())
    all_keys.update(*[debts.keys() for debts in ledger.values()])
    graph.add_nodes_from(all_keys, balance=0)
    for debtor, debts in ledger.items():
        for creditor, amount in debts.items():
            graph.add_edge(debtor, creditor, amount=int(amount * 100))


def apply_transactions(graph):
    executed_graph = nx.DiGraph(graph)
    for edge in executed_graph.edges_iter(data=True):
        u, v, data = edge
        amount = data['amount']
        executed_graph.node[u]['balance'] -= amount
        executed_graph.node[v]['balance'] += amount
    executed_graph.remove_edges_from(executed_graph.edges())
    for node, data in executed_graph.nodes_iter(data=True):
        executed_graph.node[node]['orig_balance'] = data['balance']
    return executed_graph


def generate_min_transactions(graph):
    new_graph = nx.DiGraph(graph)
    nodes = [
        (data['balance'], node)
        for node, data in new_graph.nodes_iter(data=True)
    ]
    total_tx_amount = sum(
        bal for bal, _ in nodes
        if bal > 0
    )
    creditors = [(-bal, node) for bal, node in nodes if bal > 0]
    debtors = [(bal, node) for bal, node in nodes if bal < 0]
    heapify(creditors)
    heapify(debtors)
    while total_tx_amount > 0:
        creditor_bal, creditor_node = heappop(creditors)
        debtor_bal, debtor_node = heappop(debtors)
        creditor_bal *= -1
        debtor_bal *= -1
        tx_amount = min(creditor_bal, debtor_bal)
        creditor_bal -= tx_amount
        debtor_bal -= tx_amount
        total_tx_amount -= tx_amount
        new_graph.add_edge(debtor_node, creditor_node, amount=tx_amount)
        heappush(creditors, (-creditor_bal, creditor_node))
        heappush(debtors, (-debtor_bal, debtor_node))
    return new_graph


def build_ledger_from_graph(graph):
    ledger = defaultdict(lambda: dict())
    for debtor, creditor, data in graph.edges_iter(data=True):
        amount = data['amount'] / 100
        ledger[debtor][creditor] = amount
        ledger[creditor]
    return ledger


def build_transactions_from_ledger(ledger: dict):
    transactions = []
    for debtor, debts in ledger.items():
        for creditor, amount in debts.items():
            tx = dict(
                debtor=debtor,
                creditor=creditor,
                amount="{:.02f}".format(amount)
            )
            transactions.append(tx)
    return transactions


def build_ledger_from_transactions(transactions: list):
    ledger = defaultdict(lambda: dict())
    for tx in transactions:
        creditor = tx['creditor']
        debtor = tx['debtor']
        amount = float(tx['amount'])
        ledger[debtor][creditor] = amount
        ledger[creditor]
    return ledger


def optimize_debts_from_ledger(ledger: dict):
    graph = nx.DiGraph()
    # read ledger and generate graph
    load_ledger_into_graph(graph, ledger)
    # execute all transaction edges
    applied_graph = apply_transactions(graph)
    # generate least-churn transaction edges
    generated_graph = generate_min_transactions(applied_graph)
    # generate new ledger from graph
    optimized_ledger = build_ledger_from_graph(generated_graph)
    return generated_graph, optimized_ledger
