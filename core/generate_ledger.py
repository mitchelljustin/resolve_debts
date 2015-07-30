import random

import names


def generate_ledger(num_nodes, num_transactions, max_amount, min_amount):
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
    return ledger
