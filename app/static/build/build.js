(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  onLedgerSubmit: function(ledgerObj, completion) {
    return axios.post('/optimize', ledgerObj).then((function(_this) {
      return function(responseObj) {
        var transactions;
        transactions = responseObj.data['transactions'];
        _this.refs.ledgerEditor.setTransactions(transactions);
        return completion();
      };
    })(this))["catch"]((function(_this) {
      return function(error) {
        return completion();
      };
    })(this));
  },
  render: function() {
    return React.createElement("div", {
      "className": "container"
    }, React.createElement("div", {
      "className": "row col-sm-12"
    }, React.createElement("h3", {
      "className": "text-center"
    }, " MuDelta "), React.createElement("p", null, "\t\t\t\t\tEnter debts between people and then hit Optimize to run the transaction optimizer!"), React.createElement("div", null, React.createElement(LedgerEditorViewController, {
      "ref": "ledgerEditor",
      "onLedgerSubmit": this.onLedgerSubmit
    }))));
  }
});


},{"./LedgerEditorViewController.cjsx":2}],2:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      dateLastOptimized: null,
      isOptimizing: false,
      transactions: [this.makeEmptyTransaction()]
    };
  },
  makeEmptyTransaction: function() {
    return {
      debtor: '',
      creditor: '',
      amount: 0
    };
  },
  setTransactions: function(transactions) {
    return this.setState({
      transactions: transactions
    });
  },
  onAddTransactionClick: function() {
    var newTransaction;
    newTransaction = this.makeEmptyTransaction();
    this.state.transactions.push(newTransaction);
    return this.forceUpdate();
  },
  onOptimizeClick: function() {
    var completion;
    this.setState({
      isOptimizing: true
    });
    completion = (function(_this) {
      return function() {
        return _this.setState({
          isOptimizing: false,
          dateLastOptimized: new Date()
        });
      };
    })(this);
    return this.props.onLedgerSubmit(this.state.transactions, completion);
  },
  onResetClick: function() {
    return this.setState(this.getInitialState());
  },
  onTransactionDelete: function(index) {
    this.state.transactions.splice(index, 1);
    return this.forceUpdate();
  },
  onTransactionChanged: function(transaction, index) {
    this.state.transactions[index] = transaction;
    return this.forceUpdate();
  },
  render: function() {
    var transactionViews;
    transactionViews = this.state.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "transaction": transaction,
          "onDelete": (function() {
            return _this.onTransactionDelete(index);
          }),
          "onTransactionChanged": (function(newTx) {
            return _this.onTransactionChanged(newTx, index);
          }),
          "key": index
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
    }, "\t\t\t\t\t\t\tLedger ", React.createElement("small", null, (this.state.dateLastOptimized != null ? "Last optimized " + (moment(this.state.dateLastOptimized).calendar()) : void 0))), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onAddTransactionClick
    }, "\t\t\t\t\t\t\tAdd Transaction"), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onResetClick
    }, "\t\t\t\t\t\t\tReset"), React.createElement("button", {
      "className": "btn btn-primary",
      "onClick": this.onOptimizeClick
    }, (this.state.isOptimizing ? "Optimizing.." : "Optimize!"))), React.createElement("div", {
      "className": "transactions-container"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionView.cjsx":3}],3:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  componentWillMount: function() {
    return this.setState({
      transaction: this.props.transaction
    });
  },
  componentWillReceiveProps: function(newProps) {
    return this.setState({
      transaction: newProps.transaction
    });
  },
  onRemoveButtonClick: function() {
    return this.props.onDelete();
  },
  onTransactionChanged: function(key, e) {
    var newValue, transaction;
    transaction = this.state.transaction;
    newValue = e.target.value;
    transaction[key] = newValue;
    this.setState({
      transaction: transaction
    });
    return this.props.onTransactionChanged(this.state.transaction);
  },
  render: function() {
    return React.createElement("div", null, React.createElement("a", {
      "className": "transaction-remove-button",
      "onClick": this.onRemoveButtonClick
    }, React.createElement("i", {
      "className": "glyphicon glyphicon-minus"
    })), React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "ref": "debtorInput",
      "value": this.state.transaction.debtor,
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('debtor', e);
        };
      })(this))
    }), "\t\t\t owes ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.state.transaction.creditor,
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('creditor', e);
        };
      })(this))
    }), "an amount of ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.state.transaction.amount,
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('amount', e);
        };
      })(this))
    }));
  }
});


},{}],4:[function(require,module,exports){
var AppViewController;

AppViewController = require('./AppViewController.cjsx');

React.render(React.createElement(AppViewController, null), document.getElementsByTagName('body')[0]);


},{"./AppViewController.cjsx":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFELEVBQVksVUFBWjtXQUNmLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsSUFBSyxDQUFBLGNBQUE7UUFDaEMsS0FBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBbkIsQ0FBbUMsWUFBbkM7ZUFDQSxVQUFBLENBQUE7TUFISztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUCxDQU9DLENBQUMsT0FBRCxDQVBELENBT1EsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7ZUFDTixV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QSxFQUFZLENBQUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7aUJBQU8sS0FBQyxDQUFBLG9CQUFELENBQXNCLFVBQXRCLEVBQWtDLENBQWxDO1FBQVA7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FIa0I7S0FBN0IsQ0FWSCxFQWErRCxlQWIvRCxFQWVHLEtBQUssQ0FBQyxhQUFOLENBQW9CLE9BQXBCLEVBQTZCO01BQUMsTUFBQSxFQUFRLE1BQVQ7TUFDM0IsV0FBQSxFQUFhLG1CQURjO01BRTNCLE9BQUEsRUFBVSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUZGO01BRzNCLFVBQUEsRUFBWSxDQUFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFPLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixRQUF0QixFQUFnQyxDQUFoQztRQUFQO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFELENBSGU7S0FBN0IsQ0FmSDtFQURPLENBZFI7Q0FERDs7OztBQ0RBLElBQUE7O0FBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLDBCQUFSOztBQUVwQixLQUFLLENBQUMsTUFBTixDQUNFLEtBQUssQ0FBQyxhQUFOLENBQW9CLGlCQUFwQixFQUF1QyxJQUF2QyxDQURGLEVBRUUsUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQSxDQUZ4QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdG9uTGVkZ2VyU3VibWl0OiAobGVkZ2VyT2JqLCBjb21wbGV0aW9uKSAtPlxuXHRcdGF4aW9zXG5cdFx0XHQucG9zdCgnL29wdGltaXplJywgbGVkZ2VyT2JqKVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlT2JqKSA9PlxuXHRcdFx0XHR0cmFuc2FjdGlvbnMgPSByZXNwb25zZU9iai5kYXRhWyd0cmFuc2FjdGlvbnMnXVxuXHRcdFx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iuc2V0VHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9ucylcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goKGVycm9yKSA9PiBcblx0XHRcdFx0Y29tcGxldGlvbigpXG5cdFx0XHQpXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbnRhaW5lclwifSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwicm93IGNvbC1zbS0xMlwifSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImgzXCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtY2VudGVyXCJ9LCBcIiBNdURlbHRhIFwiKSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcInBcIiwgbnVsbCwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRFbnRlciBkZWJ0cyBiZXR3ZWVuIHBlb3BsZSBhbmQgdGhlbiBoaXQgT3B0aW1pemUgdG8gcnVuIHRoZSB0cmFuc2FjdGlvbiBvcHRpbWl6ZXIhXG5cIlwiXCIpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciwgeyBcXFxuXHRcdFx0XHRcdFx0XCJyZWZcIjogXCJsZWRnZXJFZGl0b3JcIiwgIFxcXG5cdFx0XHRcdFx0XHRcIm9uTGVkZ2VyU3VibWl0XCI6IChAb25MZWRnZXJTdWJtaXQpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkxlZGdlclRyYW5zYWN0aW9uVmlldyA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXRJbml0aWFsU3RhdGU6IC0+XG5cdFx0ZGF0ZUxhc3RPcHRpbWl6ZWQ6IG51bGxcblx0XHRpc09wdGltaXppbmc6IGZhbHNlXG5cdFx0dHJhbnNhY3Rpb25zOiBbXG5cdFx0XHRAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdF1cblx0bWFrZUVtcHR5VHJhbnNhY3Rpb246IC0+IHtcblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAwXG5cdH1cblx0c2V0VHJhbnNhY3Rpb25zOiAodHJhbnNhY3Rpb25zKSAtPlxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9ucylcblxuXHRvbkFkZFRyYW5zYWN0aW9uQ2xpY2s6IC0+XG5cdFx0bmV3VHJhbnNhY3Rpb24gPSBAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMucHVzaChuZXdUcmFuc2FjdGlvbilcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRvbk9wdGltaXplQ2xpY2s6IC0+XG5cdFx0QHNldFN0YXRlKGlzT3B0aW1pemluZzogdHJ1ZSlcblx0XHRjb21wbGV0aW9uID0gPT4gXG5cdFx0XHRAc2V0U3RhdGUoXG5cdFx0XHRcdGlzT3B0aW1pemluZzogZmFsc2Vcblx0XHRcdFx0ZGF0ZUxhc3RPcHRpbWl6ZWQ6IG5ldyBEYXRlKClcblx0XHRcdClcblx0XHRAcHJvcHMub25MZWRnZXJTdWJtaXQoQHN0YXRlLnRyYW5zYWN0aW9ucywgY29tcGxldGlvbilcblx0b25SZXNldENsaWNrOiAtPlxuXHRcdEBzZXRTdGF0ZShAZ2V0SW5pdGlhbFN0YXRlKCkpXG5cdG9uVHJhbnNhY3Rpb25EZWxldGU6IChpbmRleCkgLT5cblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnNwbGljZShpbmRleCwgMSlcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRvblRyYW5zYWN0aW9uQ2hhbmdlZDogKHRyYW5zYWN0aW9uLCBpbmRleCkgLT5cblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zW2luZGV4XSA9IHRyYW5zYWN0aW9uXG5cdFx0QGZvcmNlVXBkYXRlKClcblxuXHRyZW5kZXI6IC0+XG5cdFx0dHJhbnNhY3Rpb25WaWV3cyA9IEBzdGF0ZS50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyAgXFxcblx0XHRcdFx0XCJ0cmFuc2FjdGlvblwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XCJvbkRlbGV0ZVwiOiAoPT4gQG9uVHJhbnNhY3Rpb25EZWxldGUoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwib25UcmFuc2FjdGlvbkNoYW5nZWRcIjogKChuZXdUeCkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKG5ld1R4LCBpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJrZXlcIjogKGluZGV4KX0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvd1wiLCBcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWxlZnRcIn0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0TGVkZ2VyIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic21hbGxcIiwgbnVsbCwgXHRcdFxuXHRcdFx0ICAgICAgXHRcdChcblx0XHRcdCAgICAgIFx0XHRcdGlmIEBzdGF0ZS5kYXRlTGFzdE9wdGltaXplZD8gdGhlbiBcIkxhc3Qgb3B0aW1pemVkICN7bW9tZW50KEBzdGF0ZS5kYXRlTGFzdE9wdGltaXplZCkuY2FsZW5kYXIoKX1cIlxuXHRcdFx0ICAgICAgXHRcdClcblx0XHRcdCAgICAgIFx0KVxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uQWRkVHJhbnNhY3Rpb25DbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdEFkZCBUcmFuc2FjdGlvblxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uUmVzZXRDbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFJlc2V0XG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLXByaW1hcnlcIiwgXCJvbkNsaWNrXCI6IChAb25PcHRpbWl6ZUNsaWNrKX0sXG5cdFx0XHRcdFx0XHRcdChpZiBAc3RhdGUuaXNPcHRpbWl6aW5nIHRoZW4gXCJPcHRpbWl6aW5nLi5cIiBlbHNlIFwiT3B0aW1pemUhXCIpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0XHQodHJhbnNhY3Rpb25WaWV3cylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiBAcHJvcHMudHJhbnNhY3Rpb24pXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IChuZXdQcm9wcykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IG5ld1Byb3BzLnRyYW5zYWN0aW9uKVxuXG5cdG9uUmVtb3ZlQnV0dG9uQ2xpY2s6IC0+XG5cdFx0QHByb3BzLm9uRGVsZXRlKClcblx0b25UcmFuc2FjdGlvbkNoYW5nZWQ6IChrZXksIGUpIC0+XG5cdFx0dHJhbnNhY3Rpb24gPSBAc3RhdGUudHJhbnNhY3Rpb25cblx0XHRuZXdWYWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG5cdFx0dHJhbnNhY3Rpb25ba2V5XSA9IG5ld1ZhbHVlXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbilcblx0XHRAcHJvcHMub25UcmFuc2FjdGlvbkNoYW5nZWQoQHN0YXRlLnRyYW5zYWN0aW9uKVxuXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1yZW1vdmUtYnV0dG9uXCIsIFwib25DbGlja1wiOiAoQG9uUmVtb3ZlQnV0dG9uQ2xpY2spfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdCksIFx0XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJyZWZcIjogXCJkZWJ0b3JJbnB1dFwiLCAgXFxcblx0XHRcdFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmRlYnRvciksICBcXFxuXHRcdFx0XHRcIm9uQ2hhbmdlXCI6ICgoZSkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKCdkZWJ0b3InLCBlKSl9KSwgXCJcIlwiXG5cXHRcXHRcXHQgb3dlcyBcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcblx0XHRcdFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG5cdFx0XHRcdFwidmFsdWVcIjogKEBzdGF0ZS50cmFuc2FjdGlvbi5jcmVkaXRvciksICBcXFxuXHRcdFx0XHRcIm9uQ2hhbmdlXCI6ICgoZSkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKCdjcmVkaXRvcicsIGUpKX0pLCBcIlwiXCJcbiAgICAgICBhbiBhbW91bnQgb2YgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG4gICAgICBcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuICAgICAgXHRcInZhbHVlXCI6IChAc3RhdGUudHJhbnNhY3Rpb24uYW1vdW50KSwgIFxcXG4gICAgICBcdFwib25DaGFuZ2VcIjogKChlKSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQoJ2Ftb3VudCcsIGUpKX0pXG5cdFx0KSIsIkFwcFZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBWaWV3Q29udHJvbGxlci5janN4J1xuXG5SZWFjdC5yZW5kZXIoXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlld0NvbnRyb2xsZXIsIG51bGwpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXG4pXG4iXX0=
