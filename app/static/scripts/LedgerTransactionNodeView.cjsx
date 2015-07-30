module.exports =
React.createClass
	mixins: [React.addons.LinkedStateMixin]
	getInitialState: ->
		debtorName: ''
		creditorName: ''
		amount: 0
	componentWillMount: ->
		@setTransactionObj(@props.transactionObj)
	getTransactionObj: ->
		return {
			debtor: @state.debtorName
			creditor: @state.creditorName
			amount: parseFloat(@state.amount)
		}
	setTransactionObj: (transactionObj) ->
		@setState(
			debtorName: transactionObj['debtor']
			creditorName: transactionObj['creditor']
			amount: transactionObj['amount'].toFixed(2)
		)
	render: ->
		<div>
			<input type="text" 
				className="transaction-input" 
				valueLink={@linkState('debtorName')} />
			 owes 
			<input type="text" 
				className="transaction-input" 
				valueLink={@linkState('creditorName')} />
       an amount of $
      <input type="text" 
      	className="transaction-input" 
      	id="amountInput" 
      	placeholder="Amount" 
      	valueLink={@linkState('amount')} />
		</div>