LedgerEditorViewController = require './LedgerEditorViewController.cjsx'
LedgerViewerViewController = require './LedgerViewerViewController.cjsx'

module.exports = 
React.createClass
	getInitialState: ->
		optimizedTransactions: []
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
	onKeyUp: (e) ->
		if e.ctrlKey and String.fromCharCode(e.keyCode) == 'R'
			@refs.ledgerEditor.runOptimize()

	render: ->
		return (
			<div className="container" onKeyUp={@onKeyUp}>
				<div className="row col-sm-12">
					<h2> 
						MuDelta -
						
						<small> Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. </small>
					</h2>
					<div>
						<LedgerEditorViewController
							ref="ledgerEditor"
							onLedgerSubmit={@onLedgerSubmit}
							/>
					</div>
					<LedgerViewerViewController
						transactions={@state.optimizedTransactions}
						dateLastOptimized={@state.dateLastOptimized or null}
						/>
				</div>
			</div>
		)