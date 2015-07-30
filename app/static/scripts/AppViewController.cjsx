LedgerEditorViewController = require './LedgerEditorViewController.cjsx'

module.exports = 
React.createClass
	onLedgerSubmit: (ledgerObj) ->
		console.log ledgerObj
	render: ->
		<div className="container">
			<div className="row">
				<h3 className="col-sm-2 text-center"> MuDelta </h3>
				<div className="col-sm-10">
					<LedgerEditorViewController
						onLedgerSubmit={@onLedgerSubmit}
						/>
				</div>
			</div>
		</div>