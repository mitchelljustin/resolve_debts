module.exports = 
React.createClass
	onInputKeyPress: (e) ->
		if e.key == 'Enter'
			@props.onDataEntered(@props.dataKey)
			e.preventDefault()
		else if e.key == 'Backspace' and e.target.value.length == 0
			@props.onDataDeleted(@props.dataKey)
			e.preventDefault()

	onInputChange: (e) ->
		@props.onDataChanged(@props.dataKey, e.target.value)

	render: ->
		<input 
			type="text"
			className="transaction-input"
			value={@props.value}
			disabled={@props.disabled}
			placeholder={@props.placeholder}
			name={@props.dataKey}
			onKeyUp={@onInputKeyPress}
			onChange={@onInputChange}
		/>