module.exports =
React.createClass
	componentWillMount: ->
		@setState(transaction: @props.transaction)
	componentWillReceiveProps: (newProps) ->
		@setState(transaction: newProps.transaction)

	onRemoveButtonClick: ->
		@props.onDelete()
	onTransactionChanged: (key, e) ->
		transaction = @state.transaction
		newValue = e.target.value
		transaction[key] = newValue
		@setState(transaction: transaction)
		@props.onTransactionChanged(@state.transaction)

	render: ->
		<div>
			<a className="transaction-remove-button" onClick={@onRemoveButtonClick}>
				<i className="glyphicon glyphicon-minus" />
			</a>	
			<input type="text" 
				className="transaction-input" 
				ref="debtorInput"
				value={@state.transaction.debtor}
				onChange={(e) => @onTransactionChanged('debtor', e)} />
			 owes 
			<input type="text" 
				className="transaction-input" 
				value={@state.transaction.creditor}
				onChange={(e) => @onTransactionChanged('creditor', e)} />
       an amount of 
      <input type="text" 
      	className="transaction-input" 
      	value={@state.transaction.amount}
      	onChange={(e) => @onTransactionChanged('amount', e)} />
		</div>