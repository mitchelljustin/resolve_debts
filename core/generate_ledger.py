#!/usr/local/bin/python3

from sys import stdout
import random

import yaml
import click
import names


@click.command()
@click.option('--num-transactions', '-t', default=None)
@click.option('--num-nodes', '-n', default=5)
@click.option('--min-amount', default=10)
@click.option('--max-amount', default=100)
def cli(
    num_transactions,
    num_nodes,
    min_amount,
    max_amount,
):
    max_num_transactions = num_nodes * (num_nodes - 1)
    if num_transactions is None:
        num_transactions = 10
    elif num_transactions == 'max':
        num_transactions = max_num_transactions
    elif int(num_transactions) > max_num_transactions:
        print("num transactions is larger than max num transactions ({})".format(max_num_transactions))
        exit(1)
    num_transactions = int(num_transactions)
    ledger = {}
    while len(ledger) < num_nodes:
        name = names.get_first_name()
        if name in ledger:
            continue
        ledger[name] = dict()
    keys = list(ledger.keys())
    for i in range(num_transactions):
        name_from = None
        name_to = None
        while name_to == name_from or \
                name_to in ledger[name_from]:
            name_from = random.choice(keys)
            name_to = random.choice(keys)
        amount = random.randint(min_amount * 100, max_amount * 100) / 100
        # mark entry in ledger
        ledger[name_from][name_to] = amount
    yaml.dump(ledger, stdout, default_flow_style=False)


if __name__ == '__main__':
    cli()
