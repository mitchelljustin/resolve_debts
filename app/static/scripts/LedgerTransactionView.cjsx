module.exports =
React.createClass
	mixins: [React.addons.LinkedStateMixin]
	getInitialState: ->
		debtor: ''
		creditor: ''
		amount: 0
	componentWillMount: ->
		@setTransactionObj(@props.transactionObj)
	onRemoveButtonClick: ->
		@props.onDelete()
	focus: ->
		React.findDOMNode(@refs.debtorInput).focus()
	getTransactionObj: ->
		return {
			debtor: @state.debtor
			creditor: @state.creditor
			amount: parseFloat(@state.amount)
		}
	setTransactionObj: (transactionObj) ->
		@setState(
			debtor: transactionObj['debtor']
			creditor: transactionObj['creditor']
			amount: transactionObj['amount'].toFixed(2)
		)
	render: ->
		<div>
			<a className="transaction-remove-button" onClick={@onRemoveButtonClick}>
				<i className="glyphicon glyphicon-minus" />
			</a>	
			<input type="text" 
				className="transaction-input" 
				ref="debtorInput"
				valueLink={@linkState('debtor')} />
			 owes 
			<input type="text" 
				className="transaction-input" 
				valueLink={@linkState('creditor')} />
       an amount of $
      <input type="text" 
      	className="transaction-input" 
      	id="amountInput" 
      	placeholder="Amount" 
      	valueLink={@linkState('amount')} />
		</div>