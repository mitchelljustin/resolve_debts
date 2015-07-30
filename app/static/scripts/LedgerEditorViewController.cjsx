LedgerTransactionNodeView = require './LedgerTransactionNodeView.cjsx'

module.exports = 
React.createClass
	getInitialState: ->
		transactions: []
	onAddTransactionClick: ->
		newTransaction = {
			debtor: 'Max'
			creditor: 'Mitch'
			amount: 10
		}
		@state.transactions.push(newTransaction)
		@forceUpdate()
	render: ->
		transactionViews = @state.transactions.map((transaction, index) =>
			<LedgerTransactionNodeView transactionObj={transaction} key={index} />
		)
		return (
			<div className="row" style={{marginTop: '10px'}}>
				<div className="col-sm-11 ledger-container">
					<h4 className="text-left">
						Ledger 
					</h4>
					<div className="ledger-actions">
						<button className="btn btn-default" onClick={@onAddTransactionClick}>
							Add Transaction
						</button>	
					</div>
					<div className="transactions-container" ref="transactionsContainer">
						{transactionViews}
					</div>
				</div>
			</div>
		)
