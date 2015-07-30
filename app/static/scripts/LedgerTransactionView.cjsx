module.exports =
React.createClass
	getDefaultProps: ->
		static: false

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
			{
				if !@props.static then (
					<a className="transaction-remove-button" onClick={@onRemoveButtonClick}>
						<i className="glyphicon glyphicon-minus" />
					</a>	
				) else (
					<a className="transaction-remove-button" onClick={@onRemoveButtonClick}>
						<i className="glyphicon glyphicon-ok" />
					</a>	
				)
			}
			<input type="text" 
				className="transaction-input" 
				ref="debtorInput"
				value={@state.transaction.debtor}
				placeholder="enter name"
				onChange={(e) => @onTransactionChanged('debtor', e)} 
				disabled={@props.static}
				/>
			 owes 
			<input type="text" 
				className="transaction-input" 
				value={@state.transaction.creditor}
				placeholder="enter name"
				onChange={(e) => @onTransactionChanged('creditor', e)} 
				disabled={@props.static}
				/>
       an amount of 
      <input type="text" 
      	className="transaction-input" 
      	value={@state.transaction.amount}
      	placeholder="enter amount"
      	disabled={@props.static}
      	onChange={(e) => @onTransactionChanged('amount', e)} 
      	/>
		</div>