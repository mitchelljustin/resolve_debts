from collections import defaultdict
from heapq import *

__author__ = 'mitch'


def balance_nodes_from_graph(graph):
    return [
        (data['balance'], node)
        for node, data in graph.nodes_iter(data=True)
    ]


def match_equal_balances(graph):
    nodes = balance_nodes_from_graph(graph)
    balance_dict = defaultdict(list)
    for index, (bal, name) in enumerate(nodes):
        if bal == 0:
            continue
        node = (index, bal, name)
        balance_dict[abs(bal)].append(node)
    for _, node_list in balance_dict.items():
        if len(node_list) < 2:
            continue
        creditors = [
            (index, bal, name) for index, bal, name in node_list
            if bal > 0
        ]
        debtors = [
            (index, bal, name) for index, bal, name in node_list
            if bal < 0
        ]
        for creditor, debtor in zip(creditors, debtors):
            c_index, c_bal, c_name = creditor
            d_index, d_bal, d_name = debtor
            graph.add_edge(d_name, c_name, amount=c_bal)
            graph.node[c_name]['balance'] = 0
            graph.node[d_name]['balance'] = 0


def match_extremes(new_graph):
    nodes = balance_nodes_from_graph(new_graph)
    total_tx_amount = sum(
        bal for bal, _ in nodes if bal > 0
    )
    creditors = [(-bal, name) for bal, name in nodes if bal > 0]
    debtors = [(bal, name) for bal, name in nodes if bal < 0]
    heapify(creditors)
    heapify(debtors)
    while total_tx_amount > 0:
        creditor_bal, creditor_name = heappop(creditors)
        debtor_bal, debtor_name = heappop(debtors)
        creditor_bal *= -1
        debtor_bal *= -1
        tx_amount = min(creditor_bal, debtor_bal)
        creditor_bal -= tx_amount
        debtor_bal -= tx_amount
        total_tx_amount -= tx_amount
        new_graph.add_edge(debtor_name, creditor_name, amount=tx_amount)
        heappush(creditors, (-creditor_bal, creditor_name))
        heappush(debtors, (-debtor_bal, debtor_name))
