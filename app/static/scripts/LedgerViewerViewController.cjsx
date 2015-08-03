LedgerTransactionView = require './LedgerTransactionView.cjsx'

module.exports =
React.createClass
	render: ->
		<div className="row" style={{marginTop: '10px'}}>
			<div className="col-sm-12 ledger-container">
				<div className="ledger-actions">
					<h4 className="text-left">
						Optimized Ledger 
						<small>		
						{
							if @props.dateLastOptimized? then (
								moment(@props.dateLastOptimized).calendar()
							)
						}
						</small>
					</h4>
				</div>
				<div className="transactions-container">
					{
						@props.transactions.map((transaction, index) =>
							<LedgerTransactionView
								transaction={transaction}
								static={true}
								key={index}
								/>
						)
					}
				</div>
				{
					if @props.transactions.length == 0 then (
						<span> No Transactions </span>
					)
				}
			</div>
		</div>