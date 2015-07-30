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
      transactions: [this.makeEmptyTransaction(), this.makeEmptyTransaction()]
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
  componentWillReceiveProps: function(newProps) {
    return this.setTransactionObj(newProps.transactionObj);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFEO0lBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWjtXQUNBLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsSUFBSyxDQUFBLGNBQUE7ZUFDaEMsS0FBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBbkIsQ0FBbUMsWUFBbkM7TUFGSztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUCxDQU1DLENBQUMsT0FBRCxDQU5ELENBTVEs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bmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkxlZGdlckVkaXRvclZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9MZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlci5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0b25MZWRnZXJTdWJtaXQ6IChsZWRnZXJPYmopIC0+XG5cdFx0Y29uc29sZS5sb2cgXCJzZW5kaW5nIGxlZGdlciB0byBzZXJ2ZXJcIlxuXHRcdGNvbnNvbGUubG9nIGxlZGdlck9ialxuXHRcdGF4aW9zXG5cdFx0XHQucG9zdCgnL29wdGltaXplJywgbGVkZ2VyT2JqKVxuXHRcdFx0LnRoZW4oKHJlc3BvbnNlT2JqKSA9PlxuXHRcdFx0XHR0cmFuc2FjdGlvbnMgPSByZXNwb25zZU9iai5kYXRhWyd0cmFuc2FjdGlvbnMnXVxuXHRcdFx0XHRAcmVmcy5sZWRnZXJFZGl0b3Iuc2V0VHJhbnNhY3Rpb25zKHRyYW5zYWN0aW9ucylcblx0XHRcdClcblx0XHRcdC5jYXRjaChjb25zb2xlLmVycilcblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29udGFpbmVyXCJ9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3cgY29sLXNtLTEyXCJ9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDNcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1jZW50ZXJcIn0sIFwiIE11RGVsdGEgXCIpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciwgeyBcXFxuXHRcdFx0XHRcdFx0XCJyZWZcIjogXCJsZWRnZXJFZGl0b3JcIiwgIFxcXG5cdFx0XHRcdFx0XHRcIm9uTGVkZ2VyU3VibWl0XCI6IChAb25MZWRnZXJTdWJtaXQpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KSIsIkxlZGdlclRyYW5zYWN0aW9uVmlldyA9IHJlcXVpcmUgJy4vTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LmNqc3gnXG5cbm1vZHVsZS5leHBvcnRzID0gXG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRnZXRJbml0aWFsU3RhdGU6IC0+XG5cdFx0cmV0dXJuIHtcblx0XHRcdFx0dHJhbnNhY3Rpb25zOiBbXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKCksXG5cdFx0XHRcdFx0QG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRcdFx0XVxuXHRcdH1cblx0bWFrZUVtcHR5VHJhbnNhY3Rpb246IC0+IHtcblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAwXG5cdH1cblx0Y29sbGVjdFRyYW5zYWN0aW9uczogLT5cblx0XHRmb3IgaW5kZXggaW4gWzAuLi5Ac3RhdGUudHJhbnNhY3Rpb25zLmxlbmd0aF1cblx0XHRcdHRyYW5zYWN0aW9uVmlldyA9IEByZWZzW1widHJhbnNhY3Rpb25WaWV3I3tpbmRleH1cIl1cblx0XHRcdEBzdGF0ZS50cmFuc2FjdGlvbnNbaW5kZXhdID0gdHJhbnNhY3Rpb25WaWV3LmdldFRyYW5zYWN0aW9uT2JqKClcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRzZXRUcmFuc2FjdGlvbnM6ICh0cmFuc2FjdGlvbnMpIC0+XG5cdFx0QHNldFN0YXRlKHRyYW5zYWN0aW9uczogdHJhbnNhY3Rpb25zKVxuXG5cdG9uQWRkVHJhbnNhY3Rpb25DbGljazogLT5cblx0XHRuZXdUcmFuc2FjdGlvbiA9IEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5wdXNoKG5ld1RyYW5zYWN0aW9uKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cdG9uT3B0aW1pemVDbGljazogLT5cblx0XHRAY29sbGVjdFRyYW5zYWN0aW9ucygpXG5cdFx0QHByb3BzLm9uTGVkZ2VyU3VibWl0KEBzdGF0ZS50cmFuc2FjdGlvbnMpXG5cdG9uUmVzZXRDbGljazogLT5cblx0XHRAc2V0U3RhdGUoQGdldEluaXRpYWxTdGF0ZSgpKVxuXHRvblRyYW5zYWN0aW9uRGVsZXRlOiAoaW5kZXgpIC0+XG5cdFx0QHN0YXRlLnRyYW5zYWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG5cdFx0QGZvcmNlVXBkYXRlKClcblxuXHRyZW5kZXI6IC0+XG5cdFx0dHJhbnNhY3Rpb25WaWV3cyA9IEBzdGF0ZS50cmFuc2FjdGlvbnMubWFwKCh0cmFuc2FjdGlvbiwgaW5kZXgpID0+XG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KExlZGdlclRyYW5zYWN0aW9uVmlldywgeyAgXFxcblx0XHRcdFx0XCJ0cmFuc2FjdGlvbk9ialwiOiAodHJhbnNhY3Rpb24pLCAgXFxcblx0XHRcdFx0XCJvbkRlbGV0ZVwiOiAoPT4gQG9uVHJhbnNhY3Rpb25EZWxldGUoaW5kZXgpKSwgIFxcXG5cdFx0XHRcdFwicmVmXCI6IChcInRyYW5zYWN0aW9uVmlldyN7aW5kZXh9XCIpLCAgXFxcblx0XHRcdFx0XCJrZXlcIjogKGluZGV4KX0pXG5cdFx0KVxuXHRcdHJldHVybiAoXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvd1wiLCBcInN0eWxlXCI6ICh7bWFyZ2luVG9wOiAnMTBweCd9KX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwiY29sLXNtLTEyIGxlZGdlci1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJsZWRnZXItYWN0aW9uc1wifSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoNFwiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWxlZnRcIn0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0TGVkZ2VyIFxuXCJcIlwiKSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uQWRkVHJhbnNhY3Rpb25DbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdEFkZCBUcmFuc2FjdGlvblxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1kZWZhdWx0XCIsIFwib25DbGlja1wiOiAoQG9uUmVzZXRDbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFJlc2V0XG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLXByaW1hcnlcIiwgXCJvbkNsaWNrXCI6IChAb25PcHRpbWl6ZUNsaWNrKX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0T3B0aW1pemUhXG5cIlwiXCIpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9ucy1jb250YWluZXJcIn0sXG5cdFx0XHRcdFx0XHQodHJhbnNhY3Rpb25WaWV3cylcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG5SZWFjdC5jcmVhdGVDbGFzc1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl1cblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdGRlYnRvcjogJydcblx0XHRjcmVkaXRvcjogJydcblx0XHRhbW91bnQ6IDBcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogKG5ld1Byb3BzKSAtPlxuXHRcdEBzZXRUcmFuc2FjdGlvbk9iaihuZXdQcm9wcy50cmFuc2FjdGlvbk9iailcblx0b25SZW1vdmVCdXR0b25DbGljazogLT5cblx0XHRAcHJvcHMub25EZWxldGUoKVxuXHRmb2N1czogLT5cblx0XHRSZWFjdC5maW5kRE9NTm9kZShAcmVmcy5kZWJ0b3JJbnB1dCkuZm9jdXMoKVxuXHRnZXRUcmFuc2FjdGlvbk9iajogLT5cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGVidG9yOiBAc3RhdGUuZGVidG9yXG5cdFx0XHRjcmVkaXRvcjogQHN0YXRlLmNyZWRpdG9yXG5cdFx0XHRhbW91bnQ6IHBhcnNlRmxvYXQoQHN0YXRlLmFtb3VudClcblx0XHR9XG5cdHNldFRyYW5zYWN0aW9uT2JqOiAodHJhbnNhY3Rpb25PYmopIC0+XG5cdFx0QHNldFN0YXRlKFxuXHRcdFx0ZGVidG9yOiB0cmFuc2FjdGlvbk9ialsnZGVidG9yJ11cblx0XHRcdGNyZWRpdG9yOiB0cmFuc2FjdGlvbk9ialsnY3JlZGl0b3InXVxuXHRcdFx0YW1vdW50OiB0cmFuc2FjdGlvbk9ialsnYW1vdW50J10udG9GaXhlZCgyKVxuXHRcdClcblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLXJlbW92ZS1idXR0b25cIiwgXCJvbkNsaWNrXCI6IChAb25SZW1vdmVCdXR0b25DbGljayl9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XCJjbGFzc05hbWVcIjogXCJnbHlwaGljb24gZ2x5cGhpY29uLW1pbnVzXCJ9KVxuXHRcdFx0KSwgXHRcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuXHRcdFx0XHRcInJlZlwiOiBcImRlYnRvcklucHV0XCIsICBcXFxuXHRcdFx0XHRcInZhbHVlTGlua1wiOiAoQGxpbmtTdGF0ZSgnZGVidG9yJykpfSksIFwiXCJcIlxuXFx0XFx0XFx0IG93ZXMgXG5cIlwiXCIsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuXHRcdFx0XHRcInZhbHVlTGlua1wiOiAoQGxpbmtTdGF0ZSgnY3JlZGl0b3InKSl9KSwgXCJcIlwiXG4gICAgICAgYW4gYW1vdW50IG9mICRcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcbiAgICAgIFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG4gICAgICBcdFwiaWRcIjogXCJhbW91bnRJbnB1dFwiLCAgIFxcXG4gICAgICBcdFwicGxhY2Vob2xkZXJcIjogXCJBbW91bnRcIiwgICBcXFxuICAgICAgXHRcInZhbHVlTGlua1wiOiAoQGxpbmtTdGF0ZSgnYW1vdW50JykpfSlcblx0XHQpIiwiQXBwVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcFZpZXdDb250cm9sbGVyLmNqc3gnXG5cblJlYWN0LnJlbmRlcihcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3Q29udHJvbGxlciwgbnVsbCksXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cbilcbiJdfQ==
