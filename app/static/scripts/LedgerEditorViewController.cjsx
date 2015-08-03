LedgerTransactionView = require './LedgerTransactionView.cjsx'

module.exports = 
React.createClass
	getInitialState: ->
		isOptimizing: false
		transactions: [
			@makeEmptyTransaction()
		]
	makeEmptyTransaction: -> {
		debtor: ''
		creditor: ''
		amount: ''
	}
	addEmptyTransaction: ->
		newTransaction = @makeEmptyTransaction()
		@state.transactions.push(newTransaction)
		@setState(transactions: @state.transactions)
	removeFirstTransaction: ->
		@removeTransactionAtIndex(0)
	removeTransactionAtIndex: (index) ->
		if index > 0
			@transactionViewAtIndex(index - 1).focusAmountInput()
		@state.transactions.splice(index, 1)
		@setState(transactions: @state.transactions)
	runOptimize: ->
		@setState(isOptimizing: true)
		completion = => 
			@setState(isOptimizing: false)
		@props.onLedgerSubmit(@state.transactions, completion)

	onAddTransactionClick: ->
		@addEmptyTransaction()
	onOptimizeClick: ->
		@runOptimize()
	onResetClick: ->
		@setState(@getInitialState())
	onTransactionAction: (index) ->
		@removeTransactionAtIndex(index)
	onTransactionChanged: (transaction, index) ->
		@state.transactions[index] = transaction
		@setState(transactions: @state.transactions)
	onTransactionEntered: (index) ->
		if index < @state.transactions.length - 1
			transactionView = @transactionViewAtIndex(index + 1)
			transactionView.focusDebtorInput()
		else
			@addEmptyTransaction()
	onTransactionDeleted: (index) ->
		if index > 0
			@removeTransactionAtIndex(index)

	keyForTransactionAtIndex: (index) ->
		"transactionView#{index}"
	transactionViewAtIndex: (index) ->
		key = @keyForTransactionAtIndex(index)
		return @refs[key]

	render: ->
		transactionViews = @state.transactions.map((transaction, index) =>
			<LedgerTransactionView 
				key={index}
				ref={@keyForTransactionAtIndex(index)}
				transaction={transaction}
				onAction={=> @onTransactionAction(index)}
				onTransactionChanged={(newTx) => @onTransactionChanged(newTx, index)}
				onTransactionEntered={=> @onTransactionEntered(index)}
				onTransactionDeleted={=> @onTransactionDeleted(index)}
				 />
		)
		return (
			<div 
				className="row"
				style={{marginTop: '10px'}}
				>
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
							{if @state.isOptimizing then "Optimizing.." else "Optimize!"}
						</button>
					</div>
					<div className="transactions-container" ref="transactionsContainer">
						{transactionViews}
					</div>
				</div>
			</div>
		)
