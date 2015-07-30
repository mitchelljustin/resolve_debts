LedgerTransactionView = require './LedgerTransactionView.cjsx'

module.exports = 
React.createClass
	getInitialState: ->
		return {
				transactions: [
					@makeEmptyTransaction()
				]
		}
	makeEmptyTransaction: -> {
		debtor: ''
		creditor: ''
		amount: 0
	}
	setTransactions: (transactions) ->
		@setState(transactions: transactions)

	onAddTransactionClick: ->
		newTransaction = @makeEmptyTransaction()
		@state.transactions.push(newTransaction)
		@forceUpdate()
	onOptimizeClick: ->
		@props.onLedgerSubmit(@state.transactions)
	onResetClick: ->
		@setState(@getInitialState())
	onTransactionDelete: (index) ->
		@state.transactions.splice(index, 1)
		@forceUpdate()
	onTransactionChanged: (transaction, index) ->
		@state.transactions[index] = transaction
		@forceUpdate()

	render: ->
		transactionViews = @state.transactions.map((transaction, index) =>
			<LedgerTransactionView 
				transaction={transaction}
				onDelete={=> @onTransactionDelete(index)}
				onTransactionChanged={(newTx) => @onTransactionChanged(newTx, index)}
				key={index} />
		)
		return (
			<div className="row" style={{marginTop: '10px'}}>
				<div className="col-sm-12 ledger-container">
					<div className="ledger-actions">
						<h4 className="text-left">
							Ledger 
						</h4>
						<button className="btn btn-default" onClick={@onAddTransactionClick}>
							Add Transaction
						</button>	
						<button className="btn btn-default" onClick={@onResetClick}>
							Reset
						</button>	
						<button className="btn btn-primary" onClick={@onOptimizeClick}>
							Optimize!
						</button>
					</div>
					<div className="transactions-container">
						{transactionViews}
					</div>
				</div>
			</div>
		)
