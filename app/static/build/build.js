(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  onLedgerSubmit: function(ledgerObj) {
    console.log("sending ledger to server");
    console.log(ledgerObj);
    return axios.post('/optimize', ledgerObj).then((function(_this) {
      return function(responseObj) {
        return _this.refs.ledgerEditor.setTransactions(responseObj);
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
      transactions: [this.makeEmptyTransaction(), this.makeEmptyTransaction(), this.makeEmptyTransaction(), this.makeEmptyTransaction()]
    };
  },
  makeEmptyTransaction: function() {
    return {
      debtor: '',
      creditor: '',
      amount: 0
    };
  },
  collectTransactions: function() {
    var i, index, ref, transactionView;
    for (index = i = 0, ref = this.state.transactions.length; 0 <= ref ? i < ref : i > ref; index = 0 <= ref ? ++i : --i) {
      transactionView = this.refs["transactionView" + index];
      this.state.transactions[index] = transactionView.getTransactionObj();
    }
    return this.forceUpdate();
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
    this.collectTransactions();
    return this.props.onLedgerSubmit(this.state.transactions);
  },
  onResetClick: function() {
    return this.setState(this.getInitialState());
  },
  onTransactionDelete: function(index) {
    this.state.transactions.splice(index, 1);
    return this.forceUpdate();
  },
  render: function() {
    var transactionViews;
    transactionViews = this.state.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionView, {
          "transactionObj": transaction,
          "onDelete": (function() {
            return _this.onTransactionDelete(index);
          }),
          "ref": "transactionView" + index,
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
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      debtor: '',
      creditor: '',
      amount: 0
    };
  },
  componentWillMount: function() {
    return this.setTransactionObj(this.props.transactionObj);
  },
  onRemoveButtonClick: function() {
    return this.props.onDelete();
  },
  focus: function() {
    return React.findDOMNode(this.refs.debtorInput).focus();
  },
  getTransactionObj: function() {
    return {
      debtor: this.state.debtor,
      creditor: this.state.creditor,
      amount: parseFloat(this.state.amount)
    };
  },
  setTransactionObj: function(transactionObj) {
    return this.setState({
      debtor: transactionObj['debtor'],
      creditor: transactionObj['creditor'],
      amount: transactionObj['amount'].toFixed(2)
    });
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
      "valueLink": this.linkState('debtor')
    }), "\t\t\t owes ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "valueLink": this.linkState('creditor')
    }), "an amount of $", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "id": "amountInput",
      "placeholder": "Amount",
      "valueLink": this.linkState('amount')
    }));
  }
});


},{}],4:[function(require,module,exports){
var AppViewController;

AppViewController = require('./AppViewController.cjsx');

React.render(React.createElement(AppViewController, null), document.getElementsByTagName('body')[0]);


},{"./AppViewController.cjsx":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFEO0lBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWjtXQUNBLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO2VBQ0wsS0FBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBbkIsQ0FBbUMsV0FBbkM7TUFESztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUCxDQUtDLENBQUMsT0FBRCxDQUxELENBS1EsT0FBTyxDQUFDLEdBTGhCO0VBSGUsQ0FBaEI7RUFTQSxNQUFBLEVBQVEsU0FBQTtXQUNQ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QUZ4QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdG9uTGVkZ2VyU3VibWl0OiAobGVkZ2VyT2JqKSAtPlxuXHRcdGNvbnNvbGUubG9nIFwic2VuZGluZyBsZWRnZXIgdG8gc2VydmVyXCJcblx0XHRjb25zb2xlLmxvZyBsZWRnZXJPYmpcblx0XHRheGlvc1xuXHRcdFx0LnBvc3QoJy9vcHRpbWl6ZScsIGxlZGdlck9iailcblx0XHRcdC50aGVuKChyZXNwb25zZU9iaikgPT5cblx0XHRcdFx0QHJlZnMubGVkZ2VyRWRpdG9yLnNldFRyYW5zYWN0aW9ucyhyZXNwb25zZU9iailcblx0XHRcdClcblx0XHRcdC5jYXRjaChjb25zb2xlLmVycilcblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29udGFpbmVyXCJ9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3cgY29sLXNtLTEyXCJ9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDNcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1jZW50ZXJcIn0sIFwiIE11RGVsdGEgXCIpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciwgeyBcXFxuXHRcdFx0XHRcdFx0XCJyZWZcIjogXCJsZWRnZXJFZGl0b3JcIiwgIFxcXG5cdFx0XHRcdFx0XHRcIm9uTGVkZ2VyU3VibWl0XCI6IChAb25MZWRnZXJTdWJtaXQpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkxlZGdlclRyYW5zYWN0aW9uVmlldyA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXRJbml0aWFsU3RhdGU6IC0+XG5cdFx0cmV0dXJuIHtcblx0XHRcdFx0dHJhbnNhY3Rpb25zOiBbXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKCksXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKCksXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKCksXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRcdFx0XVxuXHRcdH1cblx0bWFrZUVtcHR5VHJhbnNhY3Rpb246IC0+IHtcblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAwXG5cdH1cblx0Y29sbGVjdFRyYW5zYWN0aW9uczogLT5cblx0XHRmb3IgaW5kZXggaW4gWzAuLi5Ac3RhdGUudHJhbnNhY3Rpb25zLmxlbmd0aF1cblx0XHRcdHRyYW5zYWN0aW9uVmlldyA9IEByZWZzW1widHJhbnNhY3Rpb25WaWV3I3tpbmRleH1cIl1cblx0XHRcdEBzdGF0ZS50cmFuc2FjdGlvbnNbaW5kZXhdID0gdHJhbnNhY3Rpb25WaWV3LmdldFRyYW5zYWN0aW9uT2JqKClcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRzZXRUcmFuc2FjdGlvbnM6ICh0cmFuc2FjdGlvbnMpIC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogdHJhbnNhY3Rpb25zKVxuXG5cdG9uQWRkVHJhbnNhY3Rpb25DbGljazogLT5cblx0XHRuZXdUcmFuc2FjdGlvbiA9IEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5wdXNoKG5ld1RyYW5zYWN0aW9uKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cdG9uT3B0aW1pemVDbGljazogLT5cblx0XHRAY29sbGVjdFRyYW5zYWN0aW9ucygpXG5cdFx0QHByb3BzLm9uTGVkZ2VyU3VibWl0KEBzdGF0ZS50cmFuc2FjdGlvbnMpXG5cdG9uUmVzZXRDbGljazogLT5cblx0XHRAc2V0U3RhdGUoQGdldEluaXRpYWxTdGF0ZSgpKVxuXHRvblRyYW5zYWN0aW9uRGVsZXRlOiAoaW5kZXgpIC0+XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG5cdFx0QGZvcmNlVXBkYXRlKClcblxuXHRyZW5kZXI6IC0+XG5cdFx0dHJhbnNhY3Rpb25WaWV3cyA9IEBzdGF0ZS50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyAgXFxcblx0XHRcdFx0XCJ0cmFuc2FjdGlvbk9ialwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XCJvbkRlbGV0ZVwiOiAoPT4gQG9uVHJhbnNhY3Rpb25EZWxldGUoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwicmVmXCI6IChcInRyYW5zYWN0aW9uVmlldyN7aW5kZXh9XCIpLCAgXFxcblx0XHRcdFx0XCJrZXlcIjogKGluZGV4KX0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvd1wiLCBcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWxlZnRcIn0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0TGVkZ2VyIFxuXCJcIlwiKSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uQWRkVHJhbnNhY3Rpb25DbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdEFkZCBUcmFuc2FjdGlvblxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uUmVzZXRDbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFJlc2V0XG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLXByaW1hcnlcIiwgXCJvbkNsaWNrXCI6IChAb25PcHRpbWl6ZUNsaWNrKX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0T3B0aW1pemUhXG5cIlwiXCIpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0XHQodHJhbnNhY3Rpb25WaWV3cylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl1cblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdGRlYnRvcjogJydcblx0XHRjcmVkaXRvcjogJydcblx0XHRhbW91bnQ6IDBcblx0Y29tcG9uZW50V2lsbE1vdW50OiAtPlxuXHRcdEBzZXRUcmFuc2FjdGlvbk9iaihAcHJvcHMudHJhbnNhY3Rpb25PYmopXG5cdG9uUmVtb3ZlQnV0dG9uQ2xpY2s6IC0+XG5cdFx0QHByb3BzLm9uRGVsZXRlKClcblx0Zm9jdXM6IC0+XG5cdFx0UmVhY3QuZmluZERPTU5vZGUoQHJlZnMuZGVidG9ySW5wdXQpLmZvY3VzKClcblx0Z2V0VHJhbnNhY3Rpb25PYmo6IC0+XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRlYnRvcjogQHN0YXRlLmRlYnRvclxuXHRcdFx0Y3JlZGl0b3I6IEBzdGF0ZS5jcmVkaXRvclxuXHRcdFx0YW1vdW50OiBwYXJzZUZsb2F0KEBzdGF0ZS5hbW91bnQpXG5cdFx0fVxuXHRzZXRUcmFuc2FjdGlvbk9iajogKHRyYW5zYWN0aW9uT2JqKSAtPlxuXHRcdEBzZXRTdGF0ZShcblx0XHRcdGRlYnRvcjogdHJhbnNhY3Rpb25PYmpbJ2RlYnRvciddXG5cdFx0XHRjcmVkaXRvcjogdHJhbnNhY3Rpb25PYmpbJ2NyZWRpdG9yJ11cblx0XHRcdGFtb3VudDogdHJhbnNhY3Rpb25PYmpbJ2Ftb3VudCddLnRvRml4ZWQoMilcblx0XHQpXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYVwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1yZW1vdmUtYnV0dG9uXCIsIFwib25DbGlja1wiOiAoQG9uUmVtb3ZlQnV0dG9uQ2xpY2spfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwge1wiY2xhc3NOYW1lXCI6IFwiZ2x5cGhpY29uIGdseXBoaWNvbi1taW51c1wifSlcblx0XHRcdCksIFx0XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJyZWZcIjogXCJkZWJ0b3JJbnB1dFwiLCAgXFxcblx0XHRcdFx0XCJ2YWx1ZUxpbmtcIjogKEBsaW5rU3RhdGUoJ2RlYnRvcicpKX0pLCBcIlwiXCJcblxcdFxcdFxcdCBvd2VzIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJ2YWx1ZUxpbmtcIjogKEBsaW5rU3RhdGUoJ2NyZWRpdG9yJykpfSksIFwiXCJcIlxuICAgICAgIGFuIGFtb3VudCBvZiAkXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG4gICAgICBcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuICAgICAgXHRcImlkXCI6IFwiYW1vdW50SW5wdXRcIiwgICBcXFxuICAgICAgXHRcInBsYWNlaG9sZGVyXCI6IFwiQW1vdW50XCIsICAgXFxcbiAgICAgIFx0XCJ2YWx1ZUxpbmtcIjogKEBsaW5rU3RhdGUoJ2Ftb3VudCcpKX0pXG5cdFx0KSIsIkFwcFZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9BcHBWaWV3Q29udHJvbGxlci5janN4J1xuXG5SZWFjdC5yZW5kZXIoXG4gIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQXBwVmlld0NvbnRyb2xsZXIsIG51bGwpLFxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXG4pXG4iXX0=
