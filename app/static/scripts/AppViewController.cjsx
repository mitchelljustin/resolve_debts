hotkey = require 'react-hotkey'

hotkey.activate()

LedgerEditorViewController = require './LedgerEditorViewController.cjsx'
LedgerViewerViewController = require './LedgerViewerViewController.cjsx'

module.exports = 
React.createClass
	mixins: [hotkey.Mixin('handleHotkey')]
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

	handleHotkey: (e) ->
		if e.ctrlKey 
			switch String.fromCharCode(e.keyCode)
				when 'R'
					@refs.ledgerEditor.onOptimize()
				when 'D'
					@refs.ledgerEditor.onReset()
				when 'A'
					@refs.ledgerEditor.onAddTransaction()

	onAddTransaction: ->
		@refs.ledgerEditor.onAddTransaction()
	onReset: ->
		@refs.ledgerEditor.onReset()
	onOptimize: ->
		@refs.ledgerEditor.onOptimize()


	render: ->
		return (
			<div className="container" onKeyUp={@onKeyUp}>
				<div className="row col-sm-12">
					<h2> 
						MuDelta -
						
						<small> Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. </small>
					</h2>
					<p>
						Use Enter and Backspace to easily navigate around transactions.
					</p>
					<button className="btn btn-default" onClick={@onAddTransaction}>
						Add Transaction (Ctrl-A)
					</button>	
					<button className="btn btn-default" onClick={@onReset}>
						Reset (Ctrl-D)
					</button>	
					<button className="btn btn-primary" onClick={@onOptimize}>
						Optimize! (Ctrl-R)
					</button>
					<LedgerEditorViewController
						ref="ledgerEditor"
						onLedgerSubmit={@onLedgerSubmit}
						/>
					<LedgerViewerViewController
						transactions={@state.optimizedTransactions}
						dateLastOptimized={@state.dateLastOptimized}
						/>
				</div>
			</div>
		)