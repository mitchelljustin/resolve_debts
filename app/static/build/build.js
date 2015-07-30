(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  onLedgerSubmit: function(ledgerObj) {
    return console.log(ledgerObj);
  },
  render: function() {
    return React.createElement("div", {
      "className": "container"
    }, React.createElement("div", {
      "className": "row"
    }, React.createElement("h3", {
      "className": "col-sm-2 text-center"
    }, " MuDelta "), React.createElement("div", {
      "className": "col-sm-10"
    }, React.createElement(LedgerEditorViewController, {
      "onLedgerSubmit": this.onLedgerSubmit
    }))));
  }
});


},{"./LedgerEditorViewController.cjsx":2}],2:[function(require,module,exports){
var LedgerTransactionNodeView;

LedgerTransactionNodeView = require('./LedgerTransactionNodeView.cjsx');

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      transactions: []
    };
  },
  onAddTransactionClick: function() {
    var newTransaction;
    newTransaction = {
      debtor: 'Max',
      creditor: 'Mitch',
      amount: 10
    };
    this.state.transactions.push(newTransaction);
    return this.forceUpdate();
  },
  render: function() {
    var transactionViews;
    transactionViews = this.state.transactions.map((function(_this) {
      return function(transaction, index) {
        return React.createElement(LedgerTransactionNodeView, {
          "transactionObj": transaction,
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
      "className": "col-sm-11 ledger-container"
    }, React.createElement("h4", {
      "className": "text-left"
    }, "\t\t\t\t\t\tLedger "), React.createElement("div", {
      "className": "ledger-actions"
    }, React.createElement("button", {
      "className": "btn btn-default",
      "onClick": this.onAddTransactionClick
    }, "\t\t\t\t\t\t\tAdd Transaction")), React.createElement("div", {
      "className": "transactions-container",
      "ref": "transactionsContainer"
    }, transactionViews)));
  }
});


},{"./LedgerTransactionNodeView.cjsx":3}],3:[function(require,module,exports){
module.exports = React.createClass({displayName: "exports",
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      debtorName: '',
      creditorName: '',
      amount: 0
    };
  },
  componentWillMount: function() {
    return this.setTransactionObj(this.props.transactionObj);
  },
  getTransactionObj: function() {
    return {
      debtor: this.state.debtorName,
      creditor: this.state.creditorName,
      amount: parseFloat(this.state.amount)
    };
  },
  setTransactionObj: function(transactionObj) {
    return this.setState({
      debtorName: transactionObj['debtor'],
      creditorName: transactionObj['creditor'],
      amount: transactionObj['amount'].toFixed(2)
    });
  },
  render: function() {
    return React.createElement("div", null, React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "valueLink": this.linkState('debtorName')
    }), "\t\t\t owes ", React.createElement("input", {
      "type": "text",
      "className": "transaction-input",
      "valueLink": this.linkState('creditorName')
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvbk5vZGVWaWV3LmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvaW5kZXguY2pzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7O0FBQUEsMEJBQUEsR0FBNkIsT0FBQSxDQUFRLG1DQUFSOztBQUU3QixNQUFNLENBQUMsT0FBUCxHQUNBLEtBQUssQ0FBQyxXQUFOLENBQ0M7RUFBQSxjQUFBLEVBQWdCLFNBQUMsU0FBRDtXQUNmLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWjtFQURlLENBQWhCO0VBRUEsTUFBQSxFQUFRLFNBQUE7V0FDUCxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFDLFdBQUEsRUFBYSxXQUFkO0tBQTNCLEVBQ0MsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsS0FBcEIsRUFBMkI7TUFBQyxXQUFBLEVBQWEsS0FBZDtLQUEzQixFQUNDLEtBQUssQ0FBQyxhQUFOLENBQW9CLElBQXBCLEVBQTBCO01BQUMsV0FBQSxFQUFhLHNCQUFkO0tBQTFCLEVBQWlFLFdBQWpFLENBREQsRUFFQyxLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQixFQUEyQjtNQUFD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QixDQUFzQyxDQUFBLENBQUEsQ0FGeEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0xlZGdlckVkaXRvclZpZXdDb250cm9sbGVyLmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRvbkxlZGdlclN1Ym1pdDogKGxlZGdlck9iaikgLT5cblx0XHRjb25zb2xlLmxvZyBsZWRnZXJPYmpcblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29udGFpbmVyXCJ9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3dcIn0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMiB0ZXh0LWNlbnRlclwifSwgXCIgTXVEZWx0YSBcIiksXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEwXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFwib25MZWRnZXJTdWJtaXRcIjogKEBvbkxlZGdlclN1Ym1pdClcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpIiwiTGVkZ2VyVHJhbnNhY3Rpb25Ob2RlVmlldyA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25Ob2RlVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdHRyYW5zYWN0aW9uczogW11cblx0b25BZGRUcmFuc2FjdGlvbkNsaWNrOiAtPlxuXHRcdG5ld1RyYW5zYWN0aW9uID0ge1xuXHRcdFx0ZGVidG9yOiAnTWF4J1xuXHRcdFx0Y3JlZGl0b3I6ICdNaXRjaCdcblx0XHRcdGFtb3VudDogMTBcblx0XHR9XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5wdXNoKG5ld1RyYW5zYWN0aW9uKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cdHJlbmRlcjogLT5cblx0XHR0cmFuc2FjdGlvblZpZXdzID0gQHN0YXRlLnRyYW5zYWN0aW9ucy5tYXAoKHRyYW5zYWN0aW9uLCBpbmRleCkgPT5cblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVHJhbnNhY3Rpb25Ob2RlVmlldywge1widHJhbnNhY3Rpb25PYmpcIjogKHRyYW5zYWN0aW9uKSwgXCJrZXlcIjogKGluZGV4KX0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvd1wiLCBcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTExIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtbGVmdFwifSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRMZWRnZXIgXG5cIlwiXCIpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwibGVkZ2VyLWFjdGlvbnNcIn0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvbkFkZFRyYW5zYWN0aW9uQ2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRBZGQgVHJhbnNhY3Rpb25cblwiXCJcIilcdFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCIsIFwicmVmXCI6IFwidHJhbnNhY3Rpb25zQ29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRkZWJ0b3JOYW1lOiAnJ1xuXHRcdGNyZWRpdG9yTmFtZTogJydcblx0XHRhbW91bnQ6IDBcblx0Y29tcG9uZW50V2lsbE1vdW50OiAtPlxuXHRcdEBzZXRUcmFuc2FjdGlvbk9iaihAcHJvcHMudHJhbnNhY3Rpb25PYmopXG5cdGdldFRyYW5zYWN0aW9uT2JqOiAtPlxuXHRcdHJldHVybiB7XG5cdFx0XHRkZWJ0b3I6IEBzdGF0ZS5kZWJ0b3JOYW1lXG5cdFx0XHRjcmVkaXRvcjogQHN0YXRlLmNyZWRpdG9yTmFtZVxuXHRcdFx0YW1vdW50OiBwYXJzZUZsb2F0KEBzdGF0ZS5hbW91bnQpXG5cdFx0fVxuXHRzZXRUcmFuc2FjdGlvbk9iajogKHRyYW5zYWN0aW9uT2JqKSAtPlxuXHRcdEBzZXRTdGF0ZShcblx0XHRcdGRlYnRvck5hbWU6IHRyYW5zYWN0aW9uT2JqWydkZWJ0b3InXVxuXHRcdFx0Y3JlZGl0b3JOYW1lOiB0cmFuc2FjdGlvbk9ialsnY3JlZGl0b3InXVxuXHRcdFx0YW1vdW50OiB0cmFuc2FjdGlvbk9ialsnYW1vdW50J10udG9GaXhlZCgyKVxuXHRcdClcblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuXHRcdFx0XHRcInZhbHVlTGlua1wiOiAoQGxpbmtTdGF0ZSgnZGVidG9yTmFtZScpKX0pLCBcIlwiXCJcblxcdFxcdFxcdCBvd2VzIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJ2YWx1ZUxpbmtcIjogKEBsaW5rU3RhdGUoJ2NyZWRpdG9yTmFtZScpKX0pLCBcIlwiXCJcbiAgICAgICBhbiBhbW91bnQgb2YgJFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuICAgICAgXHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcbiAgICAgIFx0XCJpZFwiOiBcImFtb3VudElucHV0XCIsICAgXFxcbiAgICAgIFx0XCJwbGFjZWhvbGRlclwiOiBcIkFtb3VudFwiLCAgIFxcXG4gICAgICBcdFwidmFsdWVMaW5rXCI6IChAbGlua1N0YXRlKCdhbW91bnQnKSl9KVxuXHRcdCkiLCJBcHBWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vQXBwVmlld0NvbnRyb2xsZXIuY2pzeCdcblxuUmVhY3QucmVuZGVyKFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KEFwcFZpZXdDb250cm9sbGVyLCBudWxsKSxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxuKVxuIl19
