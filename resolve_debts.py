#!/usr/local/bin/python3

from sys import stdin

from heapq import *
import yaml
import networkx as nx
import matplotlib.pyplot as plt
import click


def load_ledger_into_graph(graph, ledger):
    graph.add_nodes_from(ledger.keys(), balance=0)
    for debtor, debts in ledger.items():
        for creditor, amount in debts.items():
            graph.add_edge(debtor, creditor, amount=int(amount * 100))


def execute_transactions(graph):
    for edge in graph.edges_iter(data=True):
        u, v, data = edge
        amount = data['amount']
        graph.node[u]['balance'] -= amount
        graph.node[v]['balance'] += amount
    graph.remove_edges_from(graph.edges())
    for node, data in graph.nodes_iter(data=True):
        graph.node[node]['orig_balance'] = data['balance']


def generate_min_transactions(graph):
    nodes_sorted_by_balance = sorted(
        graph.nodes_iter(data=True),
        key=lambda node: node[1]['balance'],
        reverse=True
    )
    nodes_sorted_by_balance = [
        (node, data) for node, data in nodes_sorted_by_balance if data['balance'] != 0
    ]
    creditors = [
        (node, data) for node, data in nodes_sorted_by_balance if data['balance'] > 0
    ]
    debtors = list(reversed([
                                (node, data) for node, data in nodes_sorted_by_balance if data['balance'] < 0
                                ]))
    for creditor_node, creditor_data in creditors:
        for debtor_node, debtor_data in debtors:
            creditor_balance = creditor_data['balance']
            debtor_balance = debtor_data['balance']
            if debtor_balance == 0:
                continue
            if creditor_balance == 0:
                break
            tx_amount = min(-debtor_balance, creditor_balance)
            creditor_data['balance'] -= tx_amount
            debtor_data['balance'] += tx_amount
            graph.add_edge(debtor_node, creditor_node, amount=tx_amount)
    assert all((data['balance'] == 0 for _, data in graph.nodes_iter(data=True)))


def resolve_debt(ledger: dict):
    graph = nx.DiGraph()
    # read ledger and generate graph
    load_ledger_into_graph(graph, ledger)
    # execute all transaction edges
    execute_transactions(graph)
    # generate least-churn transaction edges
    generate_min_transactions(graph)
    return graph


@click.command()
@click.option('--yml-file', '-f', type=click.File('r'))
@click.option('--draw/--no-draw', default=False)
@click.option('--show-balances/--hide-balances', default=True)
def cli(
    yml_file,
    draw,
    show_balances,
):
    if not yml_file:
        yml_file = stdin
    ledger = yaml.load(yml_file)
    resolved_graph = resolve_debt(ledger)
    print("resolution: {} transactions".format(resolved_graph.number_of_edges()))
    for node, data in resolved_graph.nodes_iter(data=True):
        balance = data['orig_balance']
        if balance == 0:
            continue
        print("{}: {:.02f}".format(node, balance / 100))
        for _, recipient, data in resolved_graph.out_edges_iter([node], data=True):
            print("  -> {}: {:.02f}".format(recipient, data['amount'] / 100))
    if draw:
        pos = nx.spring_layout(resolved_graph)
        nx.draw(
            resolved_graph,
            pos=pos,
            node_color='white',
            node_size=3000,
            with_labels=True
        )
        edge_labels = {
            (u, v): "{:.02f}".format(attribs['amount'] / 100)
            for u, v, attribs in resolved_graph.edges_iter(data=True)
        }
        nx.draw_networkx_edge_labels(
            resolved_graph,
            pos=pos,
            edge_labels=edge_labels
        )
        if show_balances:
            node_labels = {
                node: "{:.02f}".format(attribs['orig_balance'] / 100)
                for node, attribs in resolved_graph.nodes_iter(data=True)
            }
            elevated_pos = {
                key: (x, y + 5 / 100)
                for key, (x, y) in pos.items()
            }
            nx.draw_networkx_labels(
                resolved_graph,
                pos=elevated_pos,
                labels=node_labels,
                font_weight='bold'
            )
        plt.show()


if __name__ == '__main__':
    cli()
