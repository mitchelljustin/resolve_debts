#!/usr/bin/env python

from sys import stdout, stdin
import click
import networkx as nx
import yaml
from core.generate_ledger import generate_ledger
from core.resolve_debts import optimize_debts_from_ledger


@click.group()
def cli():
    pass


@cli.command()
@click.option('--num-transactions', '-t', default=None)
@click.option('--num-nodes', '-n', default=5)
@click.option('--min-amount', default=10)
@click.option('--max-amount', default=100)
def gen_ledger(
    num_transactions,
    num_nodes,
    min_amount,
    max_amount,
):
    ledger = generate_ledger(num_nodes, num_transactions, max_amount, min_amount)
    yaml.dump(ledger, stdout, default_flow_style=False)


@cli.command()
@click.option('--yml-file', '-f', type=click.File('r'))
@click.option('--draw/--no-draw', default=False)
@click.option('--show-balances/--hide-balances', default=True)
def optimize(
    yml_file,
    draw,
    show_balances,
):
    if not yml_file:
        yml_file = stdin
    ledger = yaml.load(yml_file)
    optimized_graph, optimized_ledger = optimize_debts_from_ledger(ledger)
    print("resolution: {} transactions".format(optimized_graph.number_of_edges()))
    for node, data in optimized_graph.nodes_iter(data=True):
        balance = data['orig_balance']
        if balance == 0:
            continue
        print("{}: {:.02f}".format(node, balance / 100))
        for _, recipient, data in optimized_graph.out_edges_iter([node], data=True):
            print("  -> {}: {:.02f}".format(recipient, data['amount'] / 100))
    if draw:
        import matplotlib.pyplot as plt
        pos = nx.spring_layout(optimized_graph)
        nx.draw(
            optimized_graph,
            pos=pos,
            node_color='white',
            node_size=3000,
            with_labels=True
        )
        edge_labels = {
            (u, v): "{:.02f}".format(attribs['amount'] / 100)
            for u, v, attribs in optimized_graph.edges_iter(data=True)
            }
        nx.draw_networkx_edge_labels(
            optimized_graph,
            pos=pos,
            edge_labels=edge_labels
        )
        if show_balances:
            node_labels = {
                node: "{:.02f}".format(attribs['orig_balance'] / 100)
                for node, attribs in optimized_graph.nodes_iter(data=True)
                }
            elevated_pos = {
                key: (x, y + 5 / 100)
                for key, (x, y) in pos.items()
                }
            nx.draw_networkx_labels(
                optimized_graph,
                pos=elevated_pos,
                labels=node_labels,
                font_weight='bold'
            )
        plt.show()


if __name__ == '__main__':
    cli()
