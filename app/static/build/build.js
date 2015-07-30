(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  onLedgerSubmit: function(ledgerObj) {
    console.log("sending ledger to server");
    console.log(ledgerObj);
    return axios.post('/optimize', ledgerObj).then((function(_this) {
      return function(responseObj) {
        var transactions;
        transactions = responseObj.data['transactions'];
        return _this.refs.ledgerEditor.setTransactions(transactions);
      };
    })(this))["catch"](console.err);
  },
  render: function() {
    return React.createElement("div", {
      "className": "container"
    }, React.createElement("div", {
      "className": "row col-sm-12"
    }, React.createElement("h3", {
      "className": "text-center"
    }, " MuDelta "), React.createElement("div", null, React.createElement(LedgerEditorViewController, {
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
    return this.props.onLedgerSubmit(this.state.transactions);
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
    }, "\t\t\t\t\t\t\tLedger "), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onAddTransactionClick
    }, "\t\t\t\t\t\t\tAdd Transaction"), React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onResetClick
    }, "\t\t\t\t\t\t\tReset"), React.createElement("button", {
      "className": "btn btn-primary",
      "onClick": this.onOptimizeClick
    }, "\t\t\t\t\t\t\tOptimize!")), React.createElement("div", {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFEO0lBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWjtXQUNBLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsSUFBSyxDQUFBLGNBQUE7ZUFDaEMsS0FBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBbkIsQ0FBbUMsWUFBbkM7TUFGSztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUCxDQU1DLENBQUMsT0FBRCxDQU5ELENBTVEsT0FBTyxDQUFDLEdBTmhCO0VBSGUsQ0FBaEI7RUFVQSxNQUFBLEVBQVEsU0FBQTtXQUNQLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCLEVBQTJCO01BQUMsV0FBQSxFQUFhLFdBQWQ7S0FBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSxlQUFkO0tBQTNCLEVBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsSUFBcEIsRUFBMEI7TUFBQyxXQUFBLEVBQWEsYUFBZDtLQUExQixFQUF3RCxXQUF4RCxDQURELEVBRUMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQiwwQkFBcEIsRUFBZ0Q7TUFDL0MsS0FBQSxFQUFPLGNBRHdDO01BRS9DLGdCQUFBLEVBQW1CLElBQUMsQ0FBQSxjQUYyQjtLQUFoRCxDQURELENBRkQsQ0FERDtFQURPLENBVlI7Q0FERDs7OztBQ0hBLElBQUE7O0FBQUEscUJBQUEsR0FBd0IsT0FBQSxDQUFRLDhCQUFSOztBQUV4QixNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDaEIsV0FBTztNQUNMLFlBQUEsRUFBYyxDQUNiLElBQUMsQ0FBQSxvQkFBRCxDQUFBLENBRGEsQ0FEVDs7RUFEUyxDQUFqQjtFQU1BLG9CQUFBLEVBQXNCLFNBQUE7V0FBRztNQUN4QixNQUFBLEVBQVEsRUFEZ0I7TUFFeEIsUUFBQSxFQUFVLEVBRmM7TUFHeEIsTUFBQSxFQUFRLENBSGdCOztFQUFILENBTnRCO0VBV0EsZUFBQSxFQUFpQixTQUFDLFlBQUQ7V0FDaEIsSUFBQyxDQUFBLFFBQUQsQ0FBVTtNQUFBLFlBQUEsRUFBYyxZQUFkO0tBQVY7RUFEZ0IsQ0FYakI7RUFjQSxxQkFBQSxFQUF1QixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxvQkFBRCxDQUFBO0lBQ2pCLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBWSxDQUFDLElBQXBCLENBQXlCLGNBQXpCO1dBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtFQUhzQixDQWR2QjtFQWtCQSxlQUFBLEVBQWlCLFNBQUE7V0FDaEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxjQUFQLENBQXNCLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBN0I7RUFEZ0IsQ0FsQmpCO0VBb0JBLFlBQUEsRUFBYyxTQUFBO1dBQ2IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQVY7RUFEYSxDQXBCZDtFQXNCQSxtQkFBQSxFQUFxQixTQUFDLEtBQUQ7SUFDcEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBcEIsQ0FBMkIsS0FBM0IsRUFBa0MsQ0FBbEM7V0FDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0VBRm9CLENBdEJyQjtFQXlCQSxvQkFBQSxFQUFzQixTQUFDLFdBQUQsRUFBYyxLQUFkO0lBQ3JCLElBQUMsQ0FBQSxLQUFLLENBQUMsWUFBYSxDQUFBLEtBQUEsQ0FBcEIsR0FBNkI7V0FDN0IsSUFBQyxDQUFBLFdBQUQsQ0FBQTtFQUZxQixDQXpCdEI7RUE2QkEsTUFBQSxFQUFRLFNBQUE7QUFDUCxRQUFBO0lBQUEsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBcEIsQ0FBd0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFdBQUQsRUFBYyxLQUFkO2VBQzFDLEtBQUssQ0FBQyxhQUFOLENBQW9CLHFCQUFwQixFQUEyQztVQUMxQyxhQUFBLEVBQWdCLFdBRDBCO1VBRTFDLFVBQUEsRUFBWSxDQUFDLFNBQUE7bUJBQUcsS0FBQyxDQUFBLG1CQUFELENBQXFCLEtBQXJCO1VBQUgsQ0FBRCxDQUY4QjtVQUcxQyxzQkFBQSxFQUF3QixDQUFDLFNBQUMsS0FBRDttQkFBVyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEIsRUFBNkIsS0FBN0I7VUFBWCxDQUFELENBSGtCO1VBSTFDLEtBQUEsRUFBUSxLQUprQztTQUEzQztNQUQwQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7QUFPbkIsV0FDQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSxLQUFkO01BQXFCLE9BQUEsRUFBVTtRQUFDLFNBQUEsRUFBVyxNQUFaO09BQS9CO0tBQTNCLEVBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsNEJBQWQ7S0FBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSxnQkFBZDtLQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQXBCLEVBQTBCO01BQUMsV0FBQSxFQUFhLFdBQWQ7S0FBMUIsRUFBc0QsdUJBQXRELENBREQsRUFJQyxLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixFQUE4QjtNQUFDLFdBQUEsRUFBYSxpQkFBZDtNQUFpQyxTQUFBLEVBQVksSUFBQyxDQUFBLHFCQUE5QztLQUE5QixFQUFxRywrQkFBckcsQ0FKRCxFQU9DLEtBQUssQ0FBQyxhQUFOLENBQW9CLFFBQXBCLEVBQThCO01BQUMsV0FBQSxFQUFhLGlCQUFkO01BQWlDLFNBQUEsRUFBWSxJQUFDLENBQUEsWUFBOUM7S0FBOUIsRUFBNEYscUJBQTVGLENBUEQsRUFVQyxLQUFLLENBQUMsYUFBTixDQUFvQixRQUFwQixFQUE4QjtNQUFDLFdBQUEsRUFBYSxpQkFBZDtNQUFpQyxTQUFBLEVBQVksSUFBQyxDQUFBLGVBQTlDO0tBQTlCLEVBQStGLHlCQUEvRixDQVZELENBREQsRUFlQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSx3QkFBZDtLQUEzQixFQUNFLGdCQURGLENBZkQsQ0FERDtFQVRNLENBN0JSO0NBREQ7Ozs7QUNIQSxNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxrQkFBQSxFQUFvQixTQUFBO1dBQ25CLElBQUMsQ0FBQSxRQUFELENBQVU7TUFBQSxXQUFBLEVBQWEsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFwQjtLQUFWO0VBRG1CLENBQXBCO0VBRUEseUJBQUEsRUFBMkIsU0FBQyxRQUFEO1dBQzFCLElBQUMsQ0FBQSxRQUFELENBQVU7TUFBQSxXQUFBLEVBQWEsUUFBUSxDQUFDLFdBQXRCO0tBQVY7RUFEMEIsQ0FGM0I7RUFLQSxtQkFBQSxFQUFxQixTQUFBO1dBQ3BCLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFBO0VBRG9CLENBTHJCO0VBT0Esb0JBQUEsRUFBc0IsU0FBQyxHQUFELEVBQU0sQ0FBTjtBQUNyQixRQUFBO0lBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFDckIsUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDcEIsV0FBWSxDQUFBLEdBQUEsQ0FBWixHQUFtQjtJQUNuQixJQUFDLENBQUEsUUFBRCxDQUFVO01BQUEsV0FBQSxFQUFhLFdBQWI7S0FBVjtXQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsb0JBQVAsQ0FBNEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFuQztFQUxxQixDQVB0QjtFQWNBLE1BQUEsRUFBUSxTQUFBO1dBQ1AsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkIsSUFBM0IsRUFDQyxLQUFLLENBQUMsYUFBTixDQUFvQixHQUFwQixFQUF5QjtNQUFDLFdBQUEsRUFBYSwyQkFBZDtNQUEyQyxTQUFBLEVBQVksSUFBQyxDQUFBLG1CQUF4RDtLQUF6QixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLEdBQXBCLEVBQXlCO01BQUMsV0FBQSxFQUFhLDJCQUFkO0tBQXpCLENBREQsQ0FERCxFQUlDLEtBQUssQ0FBQyxhQUFOLENBQW9CLE9BQXBCLEVBQTZCO01BQUMsTUFBQSxFQUFRLE1BQVQ7TUFDNUIsV0FBQSxFQUFhLG1CQURlO01BRTVCLEtBQUEsRUFBTyxhQUZxQjtNQUc1QixPQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFIRDtNQUk1QixVQUFBLEVBQVksQ0FBQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFBTyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsUUFBdEIsRUFBZ0MsQ0FBaEM7UUFBUDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUpnQjtLQUE3QixDQUpELEVBUTZELGNBUjdELEVBVUcsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsT0FBcEIsRUFBNkI7TUFBQyxNQUFBLEVBQVEsTUFBVDtNQUM5QixXQUFBLEVBQWEsbUJBRGlCO01BRTlCLE9BQUEsRUFBVSxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUZDO01BRzlCLFVBQUEsRUFBWSxDQUFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFPLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixVQUF0QixFQUFrQyxDQUFsQztRQUFQO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFELENBSGtCO0tBQTdCLENBVkgsRUFhK0QsZUFiL0QsRUFlRyxLQUFLLENBQUMsYUFBTixDQUFvQixPQUFwQixFQUE2QjtNQUFDLE1BQUEsRUFBUSxNQUFUO01BQzNCLFdBQUEsRUFBYSxtQkFEYztNQUUzQixPQUFBLEVBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFGRjtNQUczQixVQUFBLEVBQVksQ0FBQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRDtpQkFBTyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsUUFBdEIsRUFBZ0MsQ0FBaEM7UUFBUDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBRCxDQUhlO0tBQTdCLENBZkg7RUFETyxDQWRSO0NBREQ7Ozs7QUNEQSxJQUFBOztBQUFBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwwQkFBUjs7QUFFcEIsS0FBSyxDQUFDLE1BQU4sQ0FDRSxLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBcEIsRUFBdUMsSUFBdkMsQ0FERixFQUVFLFFBQVEsQ0FBQyxvQkFBVCxDQUE4QixNQUE5QixDQUFzQyxDQUFBLENBQUEsQ0FGeEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0xlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRvbkxlZGdlclN1Ym1pdDogKGxlZGdlck9iaikgLT5cblx0XHRjb25zb2xlLmxvZyBcInNlbmRpbmcgbGVkZ2VyIHRvIHNlcnZlclwiXG5cdFx0Y29uc29sZS5sb2cgbGVkZ2VyT2JqXG5cdFx0YXhpb3Ncblx0XHRcdC5wb3N0KCcvb3B0aW1pemUnLCBsZWRnZXJPYmopXG5cdFx0XHQudGhlbigocmVzcG9uc2VPYmopID0+XG5cdFx0XHRcdHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlT2JqLmRhdGFbJ3RyYW5zYWN0aW9ucyddXG5cdFx0XHRcdEByZWZzLmxlZGdlckVkaXRvci5zZXRUcmFuc2FjdGlvbnModHJhbnNhY3Rpb25zKVxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKGNvbnNvbGUuZXJyKVxuXHRyZW5kZXI6IC0+XG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb250YWluZXJcIn0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvdyBjb2wtc20tMTJcIn0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWNlbnRlclwifSwgXCIgTXVEZWx0YSBcIiksXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLCB7IFxcXG5cdFx0XHRcdFx0XHRcInJlZlwiOiBcImxlZGdlckVkaXRvclwiLCAgXFxcblx0XHRcdFx0XHRcdFwib25MZWRnZXJTdWJtaXRcIjogKEBvbkxlZGdlclN1Ym1pdClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25WaWV3ID0gcmVxdWlyZSAnLi9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0cmFuc2FjdGlvbnM6IFtcblx0XHRcdFx0XHRAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdFx0XHRdXG5cdFx0fVxuXHRtYWtlRW1wdHlUcmFuc2FjdGlvbjogLT4ge1xuXHRcdGRlYnRvcjogJydcblx0XHRjcmVkaXRvcjogJydcblx0XHRhbW91bnQ6IDBcblx0fVxuXHRzZXRUcmFuc2FjdGlvbnM6ICh0cmFuc2FjdGlvbnMpIC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogdHJhbnNhY3Rpb25zKVxuXG5cdG9uQWRkVHJhbnNhY3Rpb25DbGljazogLT5cblx0XHRuZXdUcmFuc2FjdGlvbiA9IEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5wdXNoKG5ld1RyYW5zYWN0aW9uKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cdG9uT3B0aW1pemVDbGljazogLT5cblx0XHRAcHJvcHMub25MZWRnZXJTdWJtaXQoQHN0YXRlLnRyYW5zYWN0aW9ucylcblx0b25SZXNldENsaWNrOiAtPlxuXHRcdEBzZXRTdGF0ZShAZ2V0SW5pdGlhbFN0YXRlKCkpXG5cdG9uVHJhbnNhY3Rpb25EZWxldGU6IChpbmRleCkgLT5cblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnNwbGljZShpbmRleCwgMSlcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRvblRyYW5zYWN0aW9uQ2hhbmdlZDogKHRyYW5zYWN0aW9uLCBpbmRleCkgLT5cblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zW2luZGV4XSA9IHRyYW5zYWN0aW9uXG5cdFx0QGZvcmNlVXBkYXRlKClcblxuXHRyZW5kZXI6IC0+XG5cdFx0dHJhbnNhY3Rpb25WaWV3cyA9IEBzdGF0ZS50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyAgXFxcblx0XHRcdFx0XCJ0cmFuc2FjdGlvblwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XCJvbkRlbGV0ZVwiOiAoPT4gQG9uVHJhbnNhY3Rpb25EZWxldGUoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwib25UcmFuc2FjdGlvbkNoYW5nZWRcIjogKChuZXdUeCkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKG5ld1R4LCBpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJrZXlcIjogKGluZGV4KX0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvd1wiLCBcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWxlZnRcIn0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0TGVkZ2VyIFxuXCJcIlwiKSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uQWRkVHJhbnNhY3Rpb25DbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdEFkZCBUcmFuc2FjdGlvblxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uUmVzZXRDbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFJlc2V0XG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLXByaW1hcnlcIiwgXCJvbkNsaWNrXCI6IChAb25PcHRpbWl6ZUNsaWNrKX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0T3B0aW1pemUhXG5cIlwiXCIpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0XHQodHJhbnNhY3Rpb25WaWV3cylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRjb21wb25lbnRXaWxsTW91bnQ6IC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiBAcHJvcHMudHJhbnNhY3Rpb24pXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IChuZXdQcm9wcykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IG5ld1Byb3BzLnRyYW5zYWN0aW9uKVxuXG5cdG9uUmVtb3ZlQnV0dG9uQ2xpY2s6IC0+XG5cdFx0QHByb3BzLm9uRGVsZXRlKClcblx0b25UcmFuc2FjdGlvbkNoYW5nZWQ6IChrZXksIGUpIC0+XG5cdFx0dHJhbnNhY3Rpb24gPSBAc3RhdGUudHJhbnNhY3Rpb25cblx0XHRuZXdWYWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG5cdFx0dHJhbnNhY3Rpb25ba2V5XSA9IG5ld1ZhbHVlXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbilcblx0XHRAcHJvcHMub25UcmFuc2FjdGlvbkNoYW5nZWQoQHN0YXRlLnRyYW5zYWN0aW9uKVxuXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1yZW1vdmUtYnV0dG9uXCIsIFwib25DbGlja1wiOiAoQG9uUmVtb3ZlQnV0dG9uQ2xpY2spfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdCksIFx0XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJyZWZcIjogXCJkZWJ0b3JJbnB1dFwiLCAgXFxcblx0XHRcdFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmRlYnRvciksICBcXFxuXHRcdFx0XHRcIm9uQ2hhbmdlXCI6ICgoZSkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKCdkZWJ0b3InLCBlKSl9KSwgXCJcIlwiXG5cXHRcXHRcXHQgb3dlcyBcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcblx0XHRcdFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG5cdFx0XHRcdFwidmFsdWVcIjogKEBzdGF0ZS50cmFuc2FjdGlvbi5jcmVkaXRvciksICBcXFxuXHRcdFx0XHRcIm9uQ2hhbmdlXCI6ICgoZSkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKCdjcmVkaXRvcicsIGUpKX0pLCBcIlwiXCJcbiAgICAgICBhbiBhbW91bnQgb2YgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG4gICAgICBcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuICAgICAgXHRcInZhbHVlXCI6IChAc3RhdGUudHJhbnNhY3Rpb24uYW1vdW50KSwgIFxcXG4gICAgICBcdFwib25DaGFuZ2VcIjogKChlKSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQoJ2Ftb3VudCcsIGUpKX0pXG5cdFx0KSIsIkFwcFZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBWaWV3Q29udHJvbGxlci5janN4J1xuXG5SZWFjdC5yZW5kZXIoXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlld0NvbnRyb2xsZXIsIG51bGwpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXG4pXG4iXX0=
