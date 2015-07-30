LedgerEditorViewController = require './LedgerEditorViewController.cjsx'

module.exports = 
React.createClass
	onLedgerSubmit: (ledgerObj, completion) ->
		axios
			.post('/optimize', ledgerObj)
			.then((responseObj) =>
				transactions = responseObj.data['transactions']
				@refs.ledgerEditor.setTransactions(transactions)
				completion()
			)
			.catch((error) => 
				completion()
			)
	render: ->
		<div className="container">
			<div className="row col-sm-12">
				<h3 className="text-center"> MuDelta </h3>
				<p> 
					Enter debts between people and then hit Optimize to run the transaction optimizer!
				</p>
				<div>
					<LedgerEditorViewController
						ref="ledgerEditor"
						onLedgerSubmit={@onLedgerSubmit}
						/>
				</div>
			</div>
		</div>