(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController, LedgerViewerViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

LedgerViewerViewController = require('./LedgerViewerViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      optimizedTransactions: null,
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
  render: function() {
    return React.createElement("div", {
      "className": "container"
    }, React.createElement("div", {
      "className": "row col-sm-12"
    }, React.createElement("h2", null, "\t\t\t\t\t\tMuDelta -\n\t\t\t\t\t\t", React.createElement("small", null, " Input IOUs between people and hit Optimize to see the best way to resolve all IOUs. ")), React.createElement("div", null, React.createElement(LedgerEditorViewController, {
      "onLedgerSubmit": this.onLedgerSubmit
    })), (this.state.optimizedTransactions ? React.createElement(LedgerViewerViewController, {
      "transactions": this.state.optimizedTransactions,
      "dateLastOptimized": this.state.dateLastOptimized
    }) : void 0)));
  }
});


},{"./LedgerEditorViewController.cjsx":2,"./LedgerViewerViewController.cjsx":4}],2:[function(require,module,exports){
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
          isOptimizing: false
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
      "className": "transactions-container"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionView.cjsx":3}],3:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  getDefaultProps: function() {
    return {
      "static": false
    };
  },
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
    return React.createElement("div", null, (!this.props["static"] ? React.createElement("a", {
      "className": "transaction-remove-button",
      "onClick": this.onRemoveButtonClick
    }, React.createElement("i", {
      "className": "glyphicon glyphicon-minus"
    })) : React.createElement("a", {
      "className": "transaction-remove-button",
      "onClick": this.onRemoveButtonClick
    }, React.createElement("i", {
      "className": "glyphicon glyphicon-ok"
    }))), React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "ref": "debtorInput",
      "value": this.state.transaction.debtor,
      "placeholder": "enter name",
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('debtor', e);
        };
      })(this)),
      "disabled": this.props["static"]
    }), "\t\t\t owes ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.state.transaction.creditor,
      "placeholder": "enter name",
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('creditor', e);
        };
      })(this)),
      "disabled": this.props["static"]
    }), "an amount of ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "value": this.state.transaction.amount,
      "placeholder": "enter amount",
      "disabled": this.props["static"],
      "onChange": ((function(_this) {
        return function(e) {
          return _this.onTransactionChanged('amount', e);
        };
      })(this))
    }));
  }
});


},{}],4:[function(require,module,exports){
var LedgerTransactionView;

LedgerTransactionView = require('./LedgerTransactionView.cjsx');

module.exports = React.createClass({displayName: "exports",
  render: function() {
    var transactionViews;
    transactionViews = this.props.transactions.map((function(_this) {
      return function(transaction) {
        return React.createElement(LedgerTransactionView, {
          "transaction": transaction,
          "static": true
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
    }, "\t\t\t\t\t\t\tOptimized Ledger ", React.createElement("small", null, moment(this.props.dateLastOptimized).calendar()))), React.createElement("div", {
      "className": "transactions-container"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionView.cjsx":3}],5:[function(require,module,exports){
var AppViewController;

AppViewController = require('./AppViewController.cjsx');

React.render(React.createElement(AppViewController, null), document.getElementsByTagName('body')[0]);


},{"./AppViewController.cjsx":1}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJWaWV3ZXJWaWV3Q29udHJvbGxlci5janN4IiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL2luZGV4LmNqc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLDBCQUFBLEdBQTZCLE9BQUEsQ0FBUSxtQ0FBUjs7QUFDN0IsMEJBQUEsR0FBNkIsT0FBQSxDQUFRLG1DQUFSOztBQUU3QixNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxlQUFBLEVBQWlCLFNBQUE7V0FDaEI7TUFBQSxxQkFBQSxFQUF1QixJQUF2QjtNQUNBLGlCQUFBLEVBQW1CLElBRG5COztFQURnQixDQUFqQjtFQUdBLGNBQUEsRUFBZ0IsU0FBQyxTQUFELEVBQVksVUFBWjtXQUNmLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtR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S0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsd0JBQWQ7S0FBM0IsRUFDRSxnQkFERixDQVhELENBREQ7RUFSTSxDQUFSO0NBREQ7Ozs7QUNIQSxJQUFBOztBQUFBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwwQkFBUjs7QUFFcEIsS0FBSyxDQUFDLE1BQU4sQ0FDRSxLQUFLLENBQUMsYUFBTixDQUFvQixpQkFBcEIsRUFBdUMsSUFBdkMsQ0FERixFQUVFLFFBQVEsQ0FBQyxvQkFBVCxDQUE4QixNQUE5QixDQUFzQyxDQUFBLENBQUEsQ0FGeEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0xlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLmNqc3gnXG5MZWRnZXJWaWV3ZXJWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyVmlld2VyVmlld0NvbnRyb2xsZXIuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRvcHRpbWl6ZWRUcmFuc2FjdGlvbnM6IG51bGxcblx0XHRkYXRlTGFzdE9wdGltaXplZDogbnVsbFxuXHRvbkxlZGdlclN1Ym1pdDogKGxlZGdlck9iaiwgY29tcGxldGlvbikgLT5cblx0XHRheGlvc1xuXHRcdFx0LnBvc3QoJy9vcHRpbWl6ZScsIGxlZGdlck9iailcblx0XHRcdC50aGVuKChyZXNwb25zZU9iaikgPT5cblx0XHRcdFx0dHJhbnNhY3Rpb25zID0gcmVzcG9uc2VPYmouZGF0YVsndHJhbnNhY3Rpb25zJ11cblx0XHRcdFx0QHNldFN0YXRlKFxuXHRcdFx0XHRcdG9wdGltaXplZFRyYW5zYWN0aW9uczogdHJhbnNhY3Rpb25zXG5cdFx0XHRcdFx0ZGF0ZUxhc3RPcHRpbWl6ZWQ6IG5ldyBEYXRlKClcblx0XHRcdFx0KVxuXHRcdFx0XHRjb21wbGV0aW9uKClcblx0XHRcdClcblx0XHRcdC5jYXRjaCgoZXJyb3IpID0+IFxuXHRcdFx0XHRjb21wbGV0aW9uKClcblx0XHRcdClcblx0cmVuZGVyOiAtPlxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbnRhaW5lclwifSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3cgY29sLXNtLTEyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoMlwiLCBudWxsLCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdE11RGVsdGEgLVxuXFx0XFx0XFx0XFx0XFx0XFx0XG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzbWFsbFwiLCBudWxsLCBcIiBJbnB1dCBJT1VzIGJldHdlZW4gcGVvcGxlIGFuZCBoaXQgT3B0aW1pemUgdG8gc2VlIHRoZSBiZXN0IHdheSB0byByZXNvbHZlIGFsbCBJT1VzLiBcIilcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFx0XCJvbkxlZGdlclN1Ym1pdFwiOiAoQG9uTGVkZ2VyU3VibWl0KVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0KGlmIEBzdGF0ZS5vcHRpbWl6ZWRUcmFuc2FjdGlvbnMgdGhlbiAoXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclZpZXdlclZpZXdDb250cm9sbGVyLCB7IFxcXG5cdFx0XHRcdFx0XHRcdFwidHJhbnNhY3Rpb25zXCI6IChAc3RhdGUub3B0aW1pemVkVHJhbnNhY3Rpb25zKSwgIFxcXG5cdFx0XHRcdFx0XHRcdFwiZGF0ZUxhc3RPcHRpbWl6ZWRcIjogKEBzdGF0ZS5kYXRlTGFzdE9wdGltaXplZClcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25WaWV3ID0gcmVxdWlyZSAnLi9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRpc09wdGltaXppbmc6IGZhbHNlXG5cdFx0dHJhbnNhY3Rpb25zOiBbXG5cdFx0XHRAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdF1cblx0bWFrZUVtcHR5VHJhbnNhY3Rpb246IC0+IHtcblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAnJ1xuXHR9XG5cblx0b25BZGRUcmFuc2FjdGlvbkNsaWNrOiAtPlxuXHRcdG5ld1RyYW5zYWN0aW9uID0gQG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnB1c2gobmV3VHJhbnNhY3Rpb24pXG5cdFx0QGZvcmNlVXBkYXRlKClcblx0b25PcHRpbWl6ZUNsaWNrOiAtPlxuXHRcdEBzZXRTdGF0ZShpc09wdGltaXppbmc6IHRydWUpXG5cdFx0Y29tcGxldGlvbiA9ID0+IFxuXHRcdFx0QHNldFN0YXRlKGlzT3B0aW1pemluZzogZmFsc2UpXG5cdFx0QHByb3BzLm9uTGVkZ2VyU3VibWl0KEBzdGF0ZS50cmFuc2FjdGlvbnMsIGNvbXBsZXRpb24pXG5cdG9uUmVzZXRDbGljazogLT5cblx0XHRAc2V0U3RhdGUoQGdldEluaXRpYWxTdGF0ZSgpKVxuXHRvblRyYW5zYWN0aW9uRGVsZXRlOiAoaW5kZXgpIC0+XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG5cdFx0QGZvcmNlVXBkYXRlKClcblx0b25UcmFuc2FjdGlvbkNoYW5nZWQ6ICh0cmFuc2FjdGlvbiwgaW5kZXgpIC0+XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9uc1tpbmRleF0gPSB0cmFuc2FjdGlvblxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cblx0cmVuZGVyOiAtPlxuXHRcdHRyYW5zYWN0aW9uVmlld3MgPSBAc3RhdGUudHJhbnNhY3Rpb25zLm1hcCgodHJhbnNhY3Rpb24sIGluZGV4KSA9PlxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvblZpZXcsIHsgIFxcXG5cdFx0XHRcdFwidHJhbnNhY3Rpb25cIjogKHRyYW5zYWN0aW9uKSwgIFxcXG5cdFx0XHRcdFwib25EZWxldGVcIjogKD0+IEBvblRyYW5zYWN0aW9uRGVsZXRlKGluZGV4KSksICBcXFxuXHRcdFx0XHRcIm9uVHJhbnNhY3Rpb25DaGFuZ2VkXCI6ICgobmV3VHgpID0+IEBvblRyYW5zYWN0aW9uQ2hhbmdlZChuZXdUeCwgaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwia2V5XCI6IChpbmRleCl9KVxuXHRcdClcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3dcIiwgXCJzdHlsZVwiOiAoe21hcmdpblRvcDogJzEwcHgnfSl9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbC1zbS0xMiBsZWRnZXItY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwibGVkZ2VyLWFjdGlvbnNcIn0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1sZWZ0XCJ9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdExlZGdlciBcblwiXCJcIiksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvbkFkZFRyYW5zYWN0aW9uQ2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRBZGQgVHJhbnNhY3Rpb25cblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvblJlc2V0Q2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRSZXNldFxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsIFwib25DbGlja1wiOiAoQG9uT3B0aW1pemVDbGljayl9LFxuXHRcdFx0XHRcdFx0XHQoaWYgQHN0YXRlLmlzT3B0aW1pemluZyB0aGVuIFwiT3B0aW1pemluZy4uXCIgZWxzZSBcIk9wdGltaXplIVwiKVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0RGVmYXVsdFByb3BzOiAtPlxuXHRcdHN0YXRpYzogZmFsc2VcblxuXHRjb21wb25lbnRXaWxsTW91bnQ6IC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiBAcHJvcHMudHJhbnNhY3Rpb24pXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IChuZXdQcm9wcykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IG5ld1Byb3BzLnRyYW5zYWN0aW9uKVxuXG5cdG9uUmVtb3ZlQnV0dG9uQ2xpY2s6IC0+XG5cdFx0QHByb3BzLm9uRGVsZXRlKClcblx0b25UcmFuc2FjdGlvbkNoYW5nZWQ6IChrZXksIGUpIC0+XG5cdFx0dHJhbnNhY3Rpb24gPSBAc3RhdGUudHJhbnNhY3Rpb25cblx0XHRuZXdWYWx1ZSA9IGUudGFyZ2V0LnZhbHVlXG5cdFx0dHJhbnNhY3Rpb25ba2V5XSA9IG5ld1ZhbHVlXG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uOiB0cmFuc2FjdGlvbilcblx0XHRAcHJvcHMub25UcmFuc2FjdGlvbkNoYW5nZWQoQHN0YXRlLnRyYW5zYWN0aW9uKVxuXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHQoXG5cdFx0XHRcdGlmICFAcHJvcHMuc3RhdGljIHRoZW4gKFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLXJlbW92ZS1idXR0b25cIiwgXCJvbkNsaWNrXCI6IChAb25SZW1vdmVCdXR0b25DbGljayl9LFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdFx0XHQpXHRcblx0XHRcdFx0KSBlbHNlIChcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1yZW1vdmUtYnV0dG9uXCIsIFwib25DbGlja1wiOiAoQG9uUmVtb3ZlQnV0dG9uQ2xpY2spfSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcImNsYXNzTmFtZVwiOiBcImdseXBoaWNvbiBnbHlwaGljb24tb2tcIn0pXG5cdFx0XHRcdFx0KVx0XG5cdFx0XHRcdClcblx0XHRcdCksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJyZWZcIjogXCJkZWJ0b3JJbnB1dFwiLCAgXFxcblx0XHRcdFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmRlYnRvciksICBcXFxuXHRcdFx0XHRcInBsYWNlaG9sZGVyXCI6IFwiZW50ZXIgbmFtZVwiLCAgXFxcblx0XHRcdFx0XCJvbkNoYW5nZVwiOiAoKGUpID0+IEBvblRyYW5zYWN0aW9uQ2hhbmdlZCgnZGVidG9yJywgZSkpLCAgIFxcXG5cdFx0XHRcdFwiZGlzYWJsZWRcIjogKEBwcm9wcy5zdGF0aWMpXG5cdFx0XHRcdH0pLCBcIlwiXCJcblxcdFxcdFxcdCBvd2VzIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmNyZWRpdG9yKSwgIFxcXG5cdFx0XHRcdFwicGxhY2Vob2xkZXJcIjogXCJlbnRlciBuYW1lXCIsICBcXFxuXHRcdFx0XHRcIm9uQ2hhbmdlXCI6ICgoZSkgPT4gQG9uVHJhbnNhY3Rpb25DaGFuZ2VkKCdjcmVkaXRvcicsIGUpKSwgICBcXFxuXHRcdFx0XHRcImRpc2FibGVkXCI6IChAcHJvcHMuc3RhdGljKVxuXHRcdFx0XHR9KSwgXCJcIlwiXG4gICAgICAgYW4gYW1vdW50IG9mIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuICAgICAgXHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcbiAgICAgIFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmFtb3VudCksICBcXFxuICAgICAgXHRcInBsYWNlaG9sZGVyXCI6IFwiZW50ZXIgYW1vdW50XCIsICBcXFxuICAgICAgXHRcImRpc2FibGVkXCI6IChAcHJvcHMuc3RhdGljKSwgIFxcXG4gICAgICBcdFwib25DaGFuZ2VcIjogKChlKSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQoJ2Ftb3VudCcsIGUpKSBcbiAgICAgIFx0fSlcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25WaWV3ID0gcmVxdWlyZSAnLi9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0cmVuZGVyOiAtPlxuXHRcdHRyYW5zYWN0aW9uVmlld3MgPSBAcHJvcHMudHJhbnNhY3Rpb25zLm1hcCgodHJhbnNhY3Rpb24pID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyBcXFxuXHRcdFx0XHRcInRyYW5zYWN0aW9uXCI6ICh0cmFuc2FjdGlvbiksICBcXFxuXHRcdFx0XHRcInN0YXRpY1wiOiAodHJ1ZSlcblx0XHRcdFx0fSlcblx0XHQpXG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwicm93XCIsIFwic3R5bGVcIjogKHttYXJnaW5Ub3A6ICcxMHB4J30pfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMTIgbGVkZ2VyLWNvbnRhaW5lclwifSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImxlZGdlci1hY3Rpb25zXCJ9LFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtbGVmdFwifSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRPcHRpbWl6ZWQgTGVkZ2VyIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwic21hbGxcIiwgbnVsbCwgXHRcdFxuXHRcdFx0ICAgICAgXHRcdChcblx0XHRcdFx0ICAgICAgXHRcdFx0bW9tZW50KEBwcm9wcy5kYXRlTGFzdE9wdGltaXplZCkuY2FsZW5kYXIoKVxuXHRcdFx0ICAgICAgXHRcdClcblx0XHRcdCAgICAgIFx0KVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkFwcFZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBWaWV3Q29udHJvbGxlci5janN4J1xuXG5SZWFjdC5yZW5kZXIoXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlld0NvbnRyb2xsZXIsIG51bGwpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXG4pXG4iXX0=
