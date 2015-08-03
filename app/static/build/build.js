(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController, LedgerViewerViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

LedgerViewerViewController = require('./LedgerViewerViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      optimizedTransactions: [],
      dateLastOptimized: null
    };
  },
  onLedgerSubmit: function(ledgerObj, completion) {
    return axios.post('/optimize', ledgerObj).then((function(_this) {
      return function(responseObj) {
        var transactions;
        transactions = responseObj.data['transactions'];
        _this.setState({
          optimizedTransactions: transactions,
          dateLastOptimized: new Date()
        });
        return completion();
      };
    })(this))["catch"]((function(_this) {
      return function(error) {
        return completion();
      };
    })(this));
  },
  onKeyUp: function(e) {
    if (e.ctrlKey && String.fromCharCode(e.keyCode) === 'R') {
      return this.refs.ledgerEditor.runOptimize();
    }
  },
  render: function() {
    return React.createElement("div", {
      "className": "container",
      "onKeyUp": this.onKeyUp
    }, React.createElement("div", {
      "className": "row col-sm-12"
    }, React.createElement("h2", null, "\t\t\t\t\t\tMuDelta -\n\t\t\t\t\t\t", React.createElement("small", null, " Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. ")), React.createElement("div", null, React.createElement(LedgerEditorViewController, {
      "ref": "ledgerEditor",
      "onLedgerSubmit": this.onLedgerSubmit
    })), React.createElement(LedgerViewerViewController, {
      "transactions": this.state.optimizedTransactions,
      "dateLastOptimized": this.state.dateLastOptimized || null
    })));
  }
});


},{"./LedgerEditorViewController.cjsx":2,"./LedgerViewerViewController.cjsx":5}],2:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      isOptimizing: false,
      transactions: [this.makeEmptyTransaction()]
    };
  },
  makeEmptyTransaction: function() {
    return {
      debtor: '',
      creditor: '',
      amount: ''
    };
  },
  addEmptyTransaction: function() {
    var newTransaction;
    newTransaction = this.makeEmptyTransaction();
    this.state.transactions.push(newTransaction);
    return this.setState({
      transactions: this.state.transactions
    });
  },
  removeFirstTransaction: function() {
    return this.removeTransactionAtIndex(0);
  },
  removeTransactionAtIndex: function(index) {
    if (index > 0) {
      this.transactionViewAtIndex(index - 1).focusAmountInput();
    }
    this.state.transactions.splice(index, 1);
    return this.setState({
      transactions: this.state.transactions
    });
  },
  runOptimize: function() {
    var completion;
    this.setState({
      isOptimizing: true
    });
    completion = (function(_this) {
      return function() {
        return _this.setState({
          isOptimizing: false
        });
      };
    })(this);
    return this.props.onLedgerSubmit(this.state.transactions, completion);
  },
  onAddTransactionClick: function() {
    return this.addEmptyTransaction();
  },
  onOptimizeClick: function() {
    return this.runOptimize();
  },
  onResetClick: function() {
    return this.setState(this.getInitialState());
  },
  onTransactionAction: function(index) {
    return this.removeTransactionAtIndex(index);
  },
  onTransactionChanged: function(transaction, index) {
    this.state.transactions[index] = transaction;
    return this.setState({
      transactions: this.state.transactions
    });
  },
  onTransactionEntered: function(index) {
    var transactionView;
    if (index < this.state.transactions.length - 1) {
      transactionView = this.transactionViewAtIndex(index + 1);
      return transactionView.focusDebtorInput();
    } else {
      return this.addEmptyTransaction();
    }
  },
  onTransactionDeleted: function(index) {
    if (index > 0) {
      return this.removeTransactionAtIndex(index);
    }
  },
  keyForTransactionAtIndex: function(index) {
    return "transactionView" + index;
  },
  transactionViewAtIndex: function(index) {
    var key;
    key = this.keyForTransactionAtIndex(index);
    return this.refs[key];
  },
  render: function() {
    var transactionViews;
    transactionViews = this.state.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "key": index,
          "ref": _this.keyForTransactionAtIndex(index),
          "transaction": transaction,
          "onAction": (function() {
            return _this.onTransactionAction(index);
          }),
          "onTransactionChanged": (function(newTx) {
            return _this.onTransactionChanged(newTx, index);
          }),
          "onTransactionEntered": (function() {
            return _this.onTransactionEntered(index);
          }),
          "onTransactionDeleted": (function() {
            return _this.onTransactionDeleted(index);
          })
        });
      };
    })(this));
    return React.createElement("div", {
      "className": "row",
      "style": {
        marginTop: '10px'
      }
    }, React.createElement("div", {
      "className": "col-sm-12 ledger-container"
    }, React.createElement("div", {
      "className": "ledger-actions"
    }, React.createElement("h4", {
      "className": "text-left"
    }, "\t\t\t\t\t\t\tLedger "), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onAddTransactionClick
    }, "\t\t\t\t\t\t\tAdd Transaction"), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onResetClick
    }, "\t\t\t\t\t\t\tReset"), React.createElement("button", {
      "className": "btn btn-primary",
      "onClick": this.onOptimizeClick
    }, (this.state.isOptimizing ? "Optimizing.." : "Optimize!"))), React.createElement("div", {
      "className": "transactions-container",
      "ref": "transactionsContainer"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionView.cjsx":4}],3:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  onInputKeyPress: function(e) {
    if (e.key === 'Enter') {
      this.props.onDataEntered(this.props.dataKey);
      return e.preventDefault();
    } else if (e.key === 'Backspace' && e.target.value.length === 0) {
      this.props.onDataDeleted(this.props.dataKey);
      return e.preventDefault();
    }
  },
  onInputChange: function(e) {
    return this.props.onDataChanged(this.props.dataKey, e.target.value);
  },
  render: function() {
    return React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.props.value,
      "disabled": this.props.disabled,
      "placeholder": this.props.placeholder,
      "name": this.props.dataKey,
      "onKeyUp": this.onInputKeyPress,
      "onChange": this.onInputChange
    });
  }
});


},{}],4:[function(require,module,exports){
var LedgerTransactionInput;

LedgerTransactionInput = require('./LedgerTransactionInput.cjsx');

module.exports = React.createClass({displayName: "exports",
  getDefaultProps: function() {
    return {
      "static": false
    };
  },
  componentDidMount: function() {
    return this.setState({
      transaction: this.props.transaction
    }, (function(_this) {
      return function() {
        return React.findDOMNode(_this.refs.debtorInput).focus();
      };
    })(this));
  },
  componentWillReceiveProps: function(newProps) {
    return this.setState({
      transaction: newProps.transaction
    });
  },
  onActionButtonClick: function() {
    if (this.props.onAction != null) {
      return this.props.onAction();
    }
  },
  onDataEntered: function(dataKey) {
    switch (dataKey) {
      case 'debtor':
        return this.focusCreditorInput();
      case 'creditor':
        return this.focusAmountInput();
      case 'amount':
        return this.props.onTransactionEntered();
    }
  },
  onDataChanged: function(dataKey, newValue) {
    var transaction;
    transaction = this.state.transaction;
    transaction[dataKey] = newValue;
    this.setState({
      transaction: transaction
    });
    return this.props.onTransactionChanged(this.state.transaction);
  },
  onDataDeleted: function(dataKey) {
    switch (dataKey) {
      case 'debtor':
        return this.props.onTransactionDeleted();
      case 'creditor':
        return this.focusDebtorInput();
      case 'amount':
        return this.focusCreditorInput();
    }
  },
  focusDebtorInput: function() {
    return React.findDOMNode(this.refs.debtorInput).focus();
  },
  focusCreditorInput: function() {
    return React.findDOMNode(this.refs.creditorInput).focus();
  },
  focusAmountInput: function() {
    return React.findDOMNode(this.refs.amountInput).focus();
  },
  makeTransactionInput: function(dataKey, placeholder) {
    return React.createElement(LedgerTransactionInput, {
      "ref": dataKey + "Input",
      "disabled": this.props["static"],
      "value": this.props.transaction[dataKey],
      "placeholder": placeholder,
      "dataKey": dataKey,
      "onDataChanged": this.onDataChanged,
      "onDataEntered": this.onDataEntered,
      "onDataDeleted": this.onDataDeleted
    });
  },
  render: function() {
    return React.createElement("div", null, React.createElement("a", {
      "className": "transaction-action-button",
      "onClick": this.onActionButtonClick
    }, (!this.props["static"] ? React.createElement("i", {
      "className": "glyphicon glyphicon-minus"
    }) : React.createElement("i", {
      "className": "glyphicon glyphicon-ok"
    }))), this.makeTransactionInput('debtor', 'enter name'), React.createElement("span", null, " owes "), this.makeTransactionInput('creditor', 'enter name'), React.createElement("span", null, " an amount of "), this.makeTransactionInput('amount', 'enter amount'));
  }
});


},{"./LedgerTransactionInput.cjsx":3}],5:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  render: function() {
    return React.createElement("div", {
      "className": "row",
      "style": {
        marginTop: '10px'
      }
    }, React.createElement("div", {
      "className": "col-sm-12 ledger-container"
    }, React.createElement("div", {
      "className": "ledger-actions"
    }, React.createElement("h4", {
      "className": "text-left"
    }, "\t\t\t\t\t\tOptimized Ledger ", React.createElement("small", null, (this.props.dateLastOptimized != null ? moment(this.props.dateLastOptimized).calendar() : void 0)))), React.createElement("div", {
      "className": "transactions-container"
    }, this.props.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "transaction": transaction,
          "static": true,
          "key": index
        });
      };
    })(this))), (this.props.transactions.length === 0 ? React.createElement("span", null, " No Transactions ") : void 0)));
  }
});


},{"./LedgerTransactionView.cjsx":4}],6:[function(require,module,exports){
var AppViewController;

AppViewController = require('./AppViewController.cjsx');

React.render(React.createElement(AppViewController, null), document.getElementsByTagName('body')[0]);


},{"./AppViewController.cjsx":1}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5ub2RlL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvQXBwVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dC5janN4IiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnRzL2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0cy9hcHAvc3RhdGljL3NjcmlwdHMvaW5kZXguY2pzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsMEJBQUEsR0FBNkIsT0FBQSxDQUFRLG1DQUFSOztBQUM3QiwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGVBQUEsRUFBaUIsU0FBQTtXQUNoQjtNQUFBLHFCQUFBLEVBQXVCLEVBQXZCO01BQ0EsaUJBQUEsRUFBbUIsSUFEbkI7O0VBRGdCLENBQWpCO0VBR0EsY0FBQSxFQUFnQixTQUFDLFNBQUQsRUFBWSxVQUFaO1dBQ2YsS0FDQyxDQUFDLElBREYsQ0FDTyxX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Q3ZCLEtBQUssQ0FBQyxhQUFOLENBQW9CLHFCQUFwQixFQUEyQztVQUMxQyxhQUFBLEVBQWdCLFdBRDBCO1VBRTFDLFFBQUEsRUFBVyxJQUYrQjtVQUcxQyxLQUFBLEVBQVEsS0FIa0M7U0FBM0M7TUFEdUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBRkYsQ0FiRCxFQXdCQyxDQUNJLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQXBCLEtBQThCLENBQWpDLEdBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsTUFBcEIsRUFBNEIsSUFBNUIsRUFBa0MsbUJBQWxDLENBREQsR0FBQSxNQURELENBeEJELENBREQ7RUFETyxDQUFSO0NBREQ7Ozs7QUNIQSxJQUFBOztBQUFBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwwQkFBUjs7QUFFcEIsS0FBSyxDQUFDLE1BQU4sQ0FDRSxLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBcEIsRUFBdUMsSUFBdkMsQ0FERixFQUVFLFFBQVEsQ0FBQyxvQkFBVCxDQUE4QixNQUE5QixDQUFzQyxDQUFBLENBQUEsQ0FGeEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0xlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLmNqc3gnXG5MZWRnZXJWaWV3ZXJWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRvcHRpbWl6ZWRUcmFuc2FjdGlvbnM6IFtdXG5cdFx0ZGF0ZUxhc3RPcHRpbWl6ZWQ6IG51bGxcblx0b25MZWRnZXJTdWJtaXQ6IChsZWRnZXJPYmosIGNvbXBsZXRpb24pIC0+XG5cdFx0YXhpb3Ncblx0XHRcdC5wb3N0KCcvb3B0aW1pemUnLCBsZWRnZXJPYmopXG5cdFx0XHQudGhlbigocmVzcG9uc2VPYmopID0+XG5cdFx0XHRcdHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlT2JqLmRhdGFbJ3RyYW5zYWN0aW9ucyddXG5cdFx0XHRcdEBzZXRTdGF0ZShcblx0XHRcdFx0XHRvcHRpbWl6ZWRUcmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9uc1xuXHRcdFx0XHRcdGRhdGVMYXN0T3B0aW1pemVkOiBuZXcgRGF0ZSgpXG5cdFx0XHRcdClcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goKGVycm9yKSA9PiBcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cdG9uS2V5VXA6IChlKSAtPlxuXHRcdGlmIGUuY3RybEtleSBhbmQgU3RyaW5nLmZyb21DaGFyQ29kZShlLmtleUNvZGUpID09ICdSJ1xuXHRcdFx0QHJlZnMubGVkZ2VyRWRpdG9yLnJ1bk9wdGltaXplKClcblxuXHRyZW5kZXI6IC0+XG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29udGFpbmVyXCIsIFwib25LZXlVcFwiOiAoQG9uS2V5VXApfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3cgY29sLXNtLTEyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMlwiLCBudWxsLCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE11RGVsdGEgLVxuXFx0XFx0XFx0XFx0XFx0XFx0XG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLCBcIiBJbnB1dCBJT1VzIGJldHdlZW4gcGVvcGxlIGFuZCBoaXQgT3B0aW1pemUgdG8gc2VlIHRoZSBiZXN0IHdheSB0byByZXNvbHZlIGFsbCBJT1VzLiBcIilcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFx0XCJyZWZcIjogXCJsZWRnZXJFZGl0b3JcIiwgIFxcXG5cdFx0XHRcdFx0XHRcdFwib25MZWRnZXJTdWJtaXRcIjogKEBvbkxlZGdlclN1Ym1pdClcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFwidHJhbnNhY3Rpb25zXCI6IChAc3RhdGUub3B0aW1pemVkVHJhbnNhY3Rpb25zKSwgIFxcXG5cdFx0XHRcdFx0XHRcImRhdGVMYXN0T3B0aW1pemVkXCI6IChAc3RhdGUuZGF0ZUxhc3RPcHRpbWl6ZWQgb3IgbnVsbClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25WaWV3ID0gcmVxdWlyZSAnLi9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRpc09wdGltaXppbmc6IGZhbHNlXG5cdFx0dHJhbnNhY3Rpb25zOiBbXG5cdFx0XHRAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdF1cblx0bWFrZUVtcHR5VHJhbnNhY3Rpb246IC0+IHtcblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAnJ1xuXHR9XG5cdGFkZEVtcHR5VHJhbnNhY3Rpb246IC0+XG5cdFx0bmV3VHJhbnNhY3Rpb24gPSBAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMucHVzaChuZXdUcmFuc2FjdGlvbilcblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb25zOiBAc3RhdGUudHJhbnNhY3Rpb25zKVxuXHRyZW1vdmVGaXJzdFRyYW5zYWN0aW9uOiAtPlxuXHRcdEByZW1vdmVUcmFuc2FjdGlvbkF0SW5kZXgoMClcblx0cmVtb3ZlVHJhbnNhY3Rpb25BdEluZGV4OiAoaW5kZXgpIC0+XG5cdFx0aWYgaW5kZXggPiAwXG5cdFx0XHRAdHJhbnNhY3Rpb25WaWV3QXRJbmRleChpbmRleCAtIDEpLmZvY3VzQW1vdW50SW5wdXQoKVxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMuc3BsaWNlKGluZGV4LCAxKVxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbnM6IEBzdGF0ZS50cmFuc2FjdGlvbnMpXG5cdHJ1bk9wdGltaXplOiAtPlxuXHRcdEBzZXRTdGF0ZShpc09wdGltaXppbmc6IHRydWUpXG5cdFx0Y29tcGxldGlvbiA9ID0+IFxuXHRcdFx0QHNldFN0YXRlKGlzT3B0aW1pemluZzogZmFsc2UpXG5cdFx0QHByb3BzLm9uTGVkZ2VyU3VibWl0KEBzdGF0ZS50cmFuc2FjdGlvbnMsIGNvbXBsZXRpb24pXG5cblx0b25BZGRUcmFuc2FjdGlvbkNsaWNrOiAtPlxuXHRcdEBhZGRFbXB0eVRyYW5zYWN0aW9uKClcblx0b25PcHRpbWl6ZUNsaWNrOiAtPlxuXHRcdEBydW5PcHRpbWl6ZSgpXG5cdG9uUmVzZXRDbGljazogLT5cblx0XHRAc2V0U3RhdGUoQGdldEluaXRpYWxTdGF0ZSgpKVxuXHRvblRyYW5zYWN0aW9uQWN0aW9uOiAoaW5kZXgpIC0+XG5cdFx0QHJlbW92ZVRyYW5zYWN0aW9uQXRJbmRleChpbmRleClcblx0b25UcmFuc2FjdGlvbkNoYW5nZWQ6ICh0cmFuc2FjdGlvbiwgaW5kZXgpIC0+XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9uc1tpbmRleF0gPSB0cmFuc2FjdGlvblxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbnM6IEBzdGF0ZS50cmFuc2FjdGlvbnMpXG5cdG9uVHJhbnNhY3Rpb25FbnRlcmVkOiAoaW5kZXgpIC0+XG5cdFx0aWYgaW5kZXggPCBAc3RhdGUudHJhbnNhY3Rpb25zLmxlbmd0aCAtIDFcblx0XHRcdHRyYW5zYWN0aW9uVmlldyA9IEB0cmFuc2FjdGlvblZpZXdBdEluZGV4KGluZGV4ICsgMSlcblx0XHRcdHRyYW5zYWN0aW9uVmlldy5mb2N1c0RlYnRvcklucHV0KClcblx0XHRlbHNlXG5cdFx0XHRAYWRkRW1wdHlUcmFuc2FjdGlvbigpXG5cdG9uVHJhbnNhY3Rpb25EZWxldGVkOiAoaW5kZXgpIC0+XG5cdFx0aWYgaW5kZXggPiAwXG5cdFx0XHRAcmVtb3ZlVHJhbnNhY3Rpb25BdEluZGV4KGluZGV4KVxuXG5cdGtleUZvclRyYW5zYWN0aW9uQXRJbmRleDogKGluZGV4KSAtPlxuXHRcdFwidHJhbnNhY3Rpb25WaWV3I3tpbmRleH1cIlxuXHR0cmFuc2FjdGlvblZpZXdBdEluZGV4OiAoaW5kZXgpIC0+XG5cdFx0a2V5ID0gQGtleUZvclRyYW5zYWN0aW9uQXRJbmRleChpbmRleClcblx0XHRyZXR1cm4gQHJlZnNba2V5XVxuXG5cdHJlbmRlcjogLT5cblx0XHR0cmFuc2FjdGlvblZpZXdzID0gQHN0YXRlLnRyYW5zYWN0aW9ucy5tYXAoKHRyYW5zYWN0aW9uLCBpbmRleCkgPT5cblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LCB7ICBcXFxuXHRcdFx0XHRcImtleVwiOiAoaW5kZXgpLCAgXFxcblx0XHRcdFx0XCJyZWZcIjogKEBrZXlGb3JUcmFuc2FjdGlvbkF0SW5kZXgoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwidHJhbnNhY3Rpb25cIjogKHRyYW5zYWN0aW9uKSwgIFxcXG5cdFx0XHRcdFwib25BY3Rpb25cIjogKD0+IEBvblRyYW5zYWN0aW9uQWN0aW9uKGluZGV4KSksICBcXFxuXHRcdFx0XHRcIm9uVHJhbnNhY3Rpb25DaGFuZ2VkXCI6ICgobmV3VHgpID0+IEBvblRyYW5zYWN0aW9uQ2hhbmdlZChuZXdUeCwgaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwib25UcmFuc2FjdGlvbkVudGVyZWRcIjogKD0+IEBvblRyYW5zYWN0aW9uRW50ZXJlZChpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJvblRyYW5zYWN0aW9uRGVsZXRlZFwiOiAoPT4gQG9uVHJhbnNhY3Rpb25EZWxldGVkKGluZGV4KSlcblx0XHRcdFx0IH0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHsgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwicm93XCIsICBcXFxuXHRcdFx0XHRcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbC1zbS0xMiBsZWRnZXItY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwibGVkZ2VyLWFjdGlvbnNcIn0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1sZWZ0XCJ9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdExlZGdlciBcblwiXCJcIiksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvbkFkZFRyYW5zYWN0aW9uQ2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRBZGQgVHJhbnNhY3Rpb25cblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvblJlc2V0Q2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRSZXNldFxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsIFwib25DbGlja1wiOiAoQG9uT3B0aW1pemVDbGljayl9LFxuXHRcdFx0XHRcdFx0XHQoaWYgQHN0YXRlLmlzT3B0aW1pemluZyB0aGVuIFwiT3B0aW1pemluZy4uXCIgZWxzZSBcIk9wdGltaXplIVwiKVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCIsIFwicmVmXCI6IFwidHJhbnNhY3Rpb25zQ29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KVxuIiwibW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdG9uSW5wdXRLZXlQcmVzczogKGUpIC0+XG5cdFx0aWYgZS5rZXkgPT0gJ0VudGVyJ1xuXHRcdFx0QHByb3BzLm9uRGF0YUVudGVyZWQoQHByb3BzLmRhdGFLZXkpXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRlbHNlIGlmIGUua2V5ID09ICdCYWNrc3BhY2UnIGFuZCBlLnRhcmdldC52YWx1ZS5sZW5ndGggPT0gMFxuXHRcdFx0QHByb3BzLm9uRGF0YURlbGV0ZWQoQHByb3BzLmRhdGFLZXkpXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblxuXHRvbklucHV0Q2hhbmdlOiAoZSkgLT5cblx0XHRAcHJvcHMub25EYXRhQ2hhbmdlZChAcHJvcHMuZGF0YUtleSwgZS50YXJnZXQudmFsdWUpXG5cblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7ICBcXFxuXHRcdFx0XCJ0eXBlXCI6IFwidGV4dFwiLCAgXFxcblx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgIFxcXG5cdFx0XHRcInZhbHVlXCI6IChAcHJvcHMudmFsdWUpLCAgXFxcblx0XHRcdFwiZGlzYWJsZWRcIjogKEBwcm9wcy5kaXNhYmxlZCksICBcXFxuXHRcdFx0XCJwbGFjZWhvbGRlclwiOiAoQHByb3BzLnBsYWNlaG9sZGVyKSwgIFxcXG5cdFx0XHRcIm5hbWVcIjogKEBwcm9wcy5kYXRhS2V5KSwgIFxcXG5cdFx0XHRcIm9uS2V5VXBcIjogKEBvbklucHV0S2V5UHJlc3MpLCAgXFxcblx0XHRcdFwib25DaGFuZ2VcIjogKEBvbklucHV0Q2hhbmdlKVxuXHRcdH0pIiwiTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dCA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25JbnB1dC5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXREZWZhdWx0UHJvcHM6IC0+XG5cdFx0c3RhdGljOiBmYWxzZVxuXG5cdGNvbXBvbmVudERpZE1vdW50OiAtPlxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbjogQHByb3BzLnRyYW5zYWN0aW9uLCA9PlxuXHRcdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuZGVidG9ySW5wdXQpLmZvY3VzKClcblx0XHQpXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IChuZXdQcm9wcykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IG5ld1Byb3BzLnRyYW5zYWN0aW9uKVxuXG5cdG9uQWN0aW9uQnV0dG9uQ2xpY2s6IC0+XG5cdFx0aWYgQHByb3BzLm9uQWN0aW9uPyBcblx0XHRcdEBwcm9wcy5vbkFjdGlvbigpXG5cdG9uRGF0YUVudGVyZWQ6IChkYXRhS2V5KSAtPlxuXHRcdHN3aXRjaCBkYXRhS2V5XG5cdFx0XHR3aGVuICdkZWJ0b3InXG5cdFx0XHRcdEBmb2N1c0NyZWRpdG9ySW5wdXQoKVxuXHRcdFx0d2hlbiAnY3JlZGl0b3InXG5cdFx0XHRcdEBmb2N1c0Ftb3VudElucHV0KClcblx0XHRcdHdoZW4gJ2Ftb3VudCdcblx0XHRcdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25FbnRlcmVkKClcblx0b25EYXRhQ2hhbmdlZDogKGRhdGFLZXksIG5ld1ZhbHVlKSAtPlxuXHRcdHRyYW5zYWN0aW9uID0gQHN0YXRlLnRyYW5zYWN0aW9uXG5cdFx0dHJhbnNhY3Rpb25bZGF0YUtleV0gPSBuZXdWYWx1ZVxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbjogdHJhbnNhY3Rpb24pXG5cdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25DaGFuZ2VkKEBzdGF0ZS50cmFuc2FjdGlvbilcblx0b25EYXRhRGVsZXRlZDogKGRhdGFLZXkpIC0+XG5cdFx0c3dpdGNoIGRhdGFLZXlcblx0XHRcdHdoZW4gJ2RlYnRvcidcblx0XHRcdFx0QHByb3BzLm9uVHJhbnNhY3Rpb25EZWxldGVkKClcblx0XHRcdHdoZW4gJ2NyZWRpdG9yJ1xuXHRcdFx0XHRAZm9jdXNEZWJ0b3JJbnB1dCgpXG5cdFx0XHR3aGVuICdhbW91bnQnXG5cdFx0XHRcdEBmb2N1c0NyZWRpdG9ySW5wdXQoKVxuXG5cdGZvY3VzRGVidG9ySW5wdXQ6IC0+XG5cdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuZGVidG9ySW5wdXQpLmZvY3VzKClcblx0Zm9jdXNDcmVkaXRvcklucHV0OiAtPlxuXHRcdFJlYWN0LmZpbmRET01Ob2RlKEByZWZzLmNyZWRpdG9ySW5wdXQpLmZvY3VzKClcblx0Zm9jdXNBbW91bnRJbnB1dDogLT5cblx0XHRSZWFjdC5maW5kRE9NTm9kZShAcmVmcy5hbW91bnRJbnB1dCkuZm9jdXMoKVxuXHRtYWtlVHJhbnNhY3Rpb25JbnB1dDogKGRhdGFLZXksIHBsYWNlaG9sZGVyKSAtPiAoXG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvbklucHV0LCB7ICBcXFxuXHRcdFx0XCJyZWZcIjogKFwiI3tkYXRhS2V5fUlucHV0XCIpLCAgXFxcblx0XHRcdFwiZGlzYWJsZWRcIjogKEBwcm9wcy5zdGF0aWMpLCAgXFxcblx0XHRcdFwidmFsdWVcIjogKEBwcm9wcy50cmFuc2FjdGlvbltkYXRhS2V5XSksICBcXFxuXHRcdFx0XCJwbGFjZWhvbGRlclwiOiAocGxhY2Vob2xkZXIpLCAgXFxcblx0XHRcdFwiZGF0YUtleVwiOiAoZGF0YUtleSksICBcXFxuXHRcdFx0XCJvbkRhdGFDaGFuZ2VkXCI6IChAb25EYXRhQ2hhbmdlZCksICBcXFxuXHRcdFx0XCJvbkRhdGFFbnRlcmVkXCI6IChAb25EYXRhRW50ZXJlZCksICBcXFxuXHRcdFx0XCJvbkRhdGFEZWxldGVkXCI6IChAb25EYXRhRGVsZXRlZClcblx0XHRcdCB9KVxuXHQpXG5cblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHsgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24tYWN0aW9uLWJ1dHRvblwiLCAgIFxcXG5cdFx0XHRcdFwib25DbGlja1wiOiAoQG9uQWN0aW9uQnV0dG9uQ2xpY2spfSxcblx0XHRcdChcblx0XHRcdFx0aWYgIUBwcm9wcy5zdGF0aWMgdGhlbiAoXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdFx0KSBlbHNlIChcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XCJjbGFzc05hbWVcIjogXCJnbHlwaGljb24gZ2x5cGhpY29uLW9rXCJ9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0KEBtYWtlVHJhbnNhY3Rpb25JbnB1dCgnZGVidG9yJywgJ2VudGVyIG5hbWUnKSksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIiBvd2VzIFwiKSxcblx0XHRcdChAbWFrZVRyYW5zYWN0aW9uSW5wdXQoJ2NyZWRpdG9yJywgJ2VudGVyIG5hbWUnKSksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcIiBhbiBhbW91bnQgb2YgXCIpLFxuXHRcdFx0KEBtYWtlVHJhbnNhY3Rpb25JbnB1dCgnYW1vdW50JywgJ2VudGVyIGFtb3VudCcpKVxuXHRcdCkiLCJMZWRnZXJUcmFuc2FjdGlvblZpZXcgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRyZW5kZXI6IC0+XG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3dcIiwgXCJzdHlsZVwiOiAoe21hcmdpblRvcDogJzEwcHgnfSl9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMTIgbGVkZ2VyLWNvbnRhaW5lclwifSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1sZWZ0XCJ9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE9wdGltaXplZCBMZWRnZXIgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLCBcdFx0XG5cdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdGlmIEBwcm9wcy5kYXRlTGFzdE9wdGltaXplZD8gdGhlbiAoXG5cdFx0XHRcdFx0XHRcdFx0bW9tZW50KEBwcm9wcy5kYXRlTGFzdE9wdGltaXplZCkuY2FsZW5kYXIoKVxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0QHByb3BzLnRyYW5zYWN0aW9ucy5tYXAoKHRyYW5zYWN0aW9uLCBpbmRleCkgPT5cblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvblZpZXcsIHsgXFxcblx0XHRcdFx0XHRcdFx0XHRcInRyYW5zYWN0aW9uXCI6ICh0cmFuc2FjdGlvbiksICBcXFxuXHRcdFx0XHRcdFx0XHRcdFwic3RhdGljXCI6ICh0cnVlKSwgIFxcXG5cdFx0XHRcdFx0XHRcdFx0XCJrZXlcIjogKGluZGV4KVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0aWYgQHByb3BzLnRyYW5zYWN0aW9ucy5sZW5ndGggPT0gMCB0aGVuIChcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIG51bGwsIFwiIE5vIFRyYW5zYWN0aW9ucyBcIilcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiQXBwVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcFZpZXdDb250cm9sbGVyLmNqc3gnXG5cblJlYWN0LnJlbmRlcihcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3Q29udHJvbGxlciwgbnVsbCksXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cbilcbiJdfQ==
