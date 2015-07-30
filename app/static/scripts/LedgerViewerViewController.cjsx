LedgerTransactionView = require './LedgerTransactionView.cjsx'

module.exports =
React.createClass
	render: ->
		transactionViews = @props.transactions.map((transaction) =>
			<LedgerTransactionView
				transaction={transaction}
				static={true}
				/>
		)
		return (
			<div className="row" style={{marginTop: '10px'}}>
				<div className="col-sm-12 ledger-container">
					<div className="ledger-actions">
						<h4 className="text-left">
							Optimized Ledger 
				      <small>		
			      		{
				      			moment(@props.dateLastOptimized).calendar()
			      		}
			      	</small>
						</h4>
					</div>
					<div className="transactions-container">
						{transactionViews}
					</div>
				</div>
			</div>
		)