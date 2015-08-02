from collections import defaultdict
from core.helpers import format_amount
from core import debt_matching

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


def generate_min_transactions(applied_graph, orig_graph):
    new_graph = nx.DiGraph(applied_graph)
    debt_matching.match_equal_balances(new_graph)
    debt_matching.match_extremes(new_graph)
    return new_graph


def build_ledger_from_graph(graph, basic=True):
    if basic:
        ledger = dict()
        for creditor, data in graph.nodes_iter(data=True):
            balance = data['orig_balance']
            if balance == 0:
                continue
            creditor_ledger = {
                debtor: data['amount'] / 100
                for _, debtor, data in graph.out_edges_iter([creditor], data=True)
            }
            if len(creditor_ledger) != 0:
                ledger[creditor] = creditor_ledger
    else:
        ledger = dict()
        for creditor, data in graph.nodes_iter(data=True):
            balance = data['orig_balance']
            if balance == 0:
                continue
            creditor_ledger = dict()
            creditor_ledger['Balance'] = balance / 100
            debts = {
                debtor: data['amount'] / 100
                for _, debtor, data in graph.out_edges_iter([creditor], data=True)
            }
            if len(debts) != 0:
                creditor_ledger['Debts'] = debts
            ledger[creditor] = creditor_ledger
    return dict(ledger)


def build_transactions_from_ledger(ledger: dict):
    transactions = []
    for debtor, debts in ledger.items():
        for creditor, amount in debts.items():
            tx = dict(
                debtor=debtor,
                creditor=creditor,
                amount=format_amount(amount)
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
        ledger[creditor] = ledger[creditor]
    return ledger


def optimize_debts_from_ledger(ledger: dict, **kwargs):
    graph = nx.DiGraph()
    # read ledger and generate graph
    load_ledger_into_graph(graph, ledger)
    # execute all transaction edges
    applied_graph = apply_transactions(graph)
    # generate least-churn transaction edges
    generated_graph = generate_min_transactions(applied_graph, graph)
    # generate new ledger from graph
    optimized_ledger = build_ledger_from_graph(generated_graph, **kwargs)
    return generated_graph, optimized_ledger
