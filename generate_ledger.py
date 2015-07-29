from sys import stdout
import yaml
import click
import names
import random


@click.command()
@click.option('--num-transactions', '-t', default=10)
@click.option('--num-nodes', '-n', default=5)
@click.option('--min-amount', default=10)
@click.option('--max-amount', default=100)
def cli(
    num_transactions,
    num_nodes,
    min_amount,
    max_amount,
):
    ledger = {
        names.get_first_name(): dict()
        for _ in range(num_nodes)
        }
    keys = list(ledger.keys())
    for _ in range(num_transactions):
        name_from = random.choice(keys)
        name_to = random.choice(keys)
        amount = random.randint(min_amount * 100, max_amount * 100) / 100
        ledger[name_from][name_to] = amount
    yaml.dump(ledger, stdout, default_flow_style=False)


if __name__ == '__main__':
    cli()
