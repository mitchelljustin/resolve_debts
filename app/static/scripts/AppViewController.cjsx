LedgerEditorViewController = require './LedgerEditorViewController.cjsx'

module.exports = 
React.createClass
	onLedgerSubmit: (ledgerObj) ->
		console.log "sending ledger to server"
		console.log ledgerObj
		axios
			.post('/optimize', ledgerObj)
			.then((responseObj) =>
				@refs.ledgerEditor.setTransactions(responseObj)
			)
			.catch(console.err)
	render: ->
		<div className="container">
			<div className="row col-sm-12">
				<h3 className="text-center"> MuDelta </h3>
				<div>
					<LedgerEditorViewController
						ref="ledgerEditor"
						onLedgerSubmit={@onLedgerSubmit}
						/>
				</div>
			</div>
		</div>