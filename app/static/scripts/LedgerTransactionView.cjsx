LedgerTransactionInput = require './LedgerTransactionInput.cjsx'

module.exports =
React.createClass
	getDefaultProps: ->
		static: false

	componentDidMount: ->
		@setState(transaction: @props.transaction, =>
			React.findDOMNode(@refs.debtorInput).focus()
		)
	componentWillReceiveProps: (newProps) ->
		@setState(transaction: newProps.transaction)

	onActionButtonClick: ->
		if @props.onAction? 
			@props.onAction()
	onDataEntered: (dataKey) ->
		switch dataKey
			when 'debtor'
				@focusCreditorInput()
			when 'creditor'
				@focusAmountInput()
			when 'amount'
				@props.onTransactionEntered()
	onDataChanged: (dataKey, newValue) ->
		transaction = @state.transaction
		transaction[dataKey] = newValue
		@setState(transaction: transaction)
		@props.onTransactionChanged(@state.transaction)
	onDataDeleted: (dataKey) ->
		switch dataKey
			when 'debtor'
				@props.onTransactionDeleted()
			when 'creditor'
				@focusDebtorInput()
			when 'amount'
				@focusCreditorInput()
	handleHotkey: (e) ->
		if e.ctrlKey
			switch String.fromCharCode(e.keyCode)
				when 'S'
					@props.onTransactionDeleted()
	focusDebtorInput: ->
		React.findDOMNode(@refs.debtorInput).focus()
	focusCreditorInput: ->
		React.findDOMNode(@refs.creditorInput).focus()
	focusAmountInput: ->
		React.findDOMNode(@refs.amountInput).focus()
	makeTransactionInput: (dataKey, placeholder) -> (
		<LedgerTransactionInput 
			ref={"#{dataKey}Input"}
			disabled={@props.static}
			value={@props.transaction[dataKey]}
			placeholder={placeholder}
			dataKey={dataKey}
			onDataChanged={@onDataChanged}
			onDataEntered={@onDataEntered}
			onDataDeleted={@onDataDeleted}
			 />
	)

	render: ->
		<div>
			<a 
				className="transaction-action-button" 
				onClick={@onActionButtonClick}>
			{
				if !@props.static then (
					<i className="glyphicon glyphicon-minus" />
				) else (
					<i className="glyphicon glyphicon-ok" />
				)
			}
			</a>
			{@makeTransactionInput('debtor', 'enter name')}
			<span> owes </span>
			{@makeTransactionInput('creditor', 'enter name')}
			<span> an amount of </span>
			{@makeTransactionInput('amount', 'enter amount')}
		</div>