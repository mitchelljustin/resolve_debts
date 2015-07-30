LedgerEditorViewController = require './LedgerEditorViewController.cjsx'
LedgerViewerViewController = require './LedgerViewerViewController.cjsx'

module.exports = 
React.createClass
	getInitialState: ->
		optimizedTransactions: null
		dateLastOptimized: null
	onLedgerSubmit: (ledgerObj, completion) ->
		axios
			.post('/optimize', ledgerObj)
			.then((responseObj) =>
				transactions = responseObj.data['transactions']
				@setState(
					optimizedTransactions: transactions
					dateLastOptimized: new Date()
				)
				completion()
			)
			.catch((error) => 
				completion()
			)
	render: ->
		return (
			<div className="container">
				<div className="row col-sm-12">
					<h2> 
						MuDelta -
						<small> Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. </small>
					</h2>
					<div>
						<LedgerEditorViewController
							onLedgerSubmit={@onLedgerSubmit}
							/>
					</div>
					{if @state.optimizedTransactions then (
						<LedgerViewerViewController
							transactions={@state.optimizedTransactions}
							dateLastOptimized={@state.dateLastOptimized}
							/>
						)
					}
				</div>
			</div>
		)