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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFEO0lBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwQkFBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWjtXQUNBLEtBQ0MsQ0FBQyxJQURGLENBQ08sV0FEUCxFQUNvQixTQURwQixDQUVDLENBQUMsSUFGRixDQUVPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxXQUFEO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZSxXQUFXLENBQUMsSUFBSyxDQUFBLGNBQUE7ZUFDaEMsS0FBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBbkIsQ0FBbUMsWUFBbkM7TUFGSztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGUCxDQU1DLENBQUMsT0FBRCxDQU5ELENBTVEs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LEVBRUUsUUFBUSxDQUFDLG9CQUFULENBQThCLE1BQTlCLENBQXNDLENBQUEsQ0FBQSxDQUZ4QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJMZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCdcblxubW9kdWxlLmV4cG9ydHMgPSBcblJlYWN0LmNyZWF0ZUNsYXNzXG5cdG9uTGVkZ2VyU3VibWl0OiAobGVkZ2VyT2JqKSAtPlxuXHRcdGNvbnNvbGUubG9nIFwic2VuZGluZyBsZWRnZXIgdG8gc2VydmVyXCJcblx0XHRjb25zb2xlLmxvZyBsZWRnZXJPYmpcblx0XHRheGlvc1xuXHRcdFx0LnBvc3QoJy9vcHRpbWl6ZScsIGxlZGdlck9iailcblx0XHRcdC50aGVuKChyZXNwb25zZU9iaikgPT5cblx0XHRcdFx0dHJhbnNhY3Rpb25zID0gcmVzcG9uc2VPYmouZGF0YVsndHJhbnNhY3Rpb25zJ11cblx0XHRcdFx0QHJlZnMubGVkZ2VyRWRpdG9yLnNldFRyYW5zYWN0aW9ucyh0cmFuc2FjdGlvbnMpXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goY29uc29sZS5lcnIpXG5cdHJlbmRlcjogLT5cblx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbnRhaW5lclwifSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwicm93IGNvbC1zbS0xMlwifSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImgzXCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtY2VudGVyXCJ9LCBcIiBNdURlbHRhIFwiKSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFwicmVmXCI6IFwibGVkZ2VyRWRpdG9yXCIsICBcXFxuXHRcdFx0XHRcdFx0XCJvbkxlZGdlclN1Ym1pdFwiOiAoQG9uTGVkZ2VyU3VibWl0KVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCkiLCJMZWRnZXJUcmFuc2FjdGlvblZpZXcgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdHJldHVybiB7XG5cdFx0XHRcdHRyYW5zYWN0aW9uczogW1xuXHRcdFx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpLFxuXHRcdFx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpLFxuXHRcdFx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpLFxuXHRcdFx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0XHRcdF1cblx0XHR9XG5cdG1ha2VFbXB0eVRyYW5zYWN0aW9uOiAtPiB7XG5cdFx0ZGVidG9yOiAnJ1xuXHRcdGNyZWRpdG9yOiAnJ1xuXHRcdGFtb3VudDogMFxuXHR9XG5cdGNvbGxlY3RUcmFuc2FjdGlvbnM6IC0+XG5cdFx0Zm9yIGluZGV4IGluIFswLi4uQHN0YXRlLnRyYW5zYWN0aW9ucy5sZW5ndGhdXG5cdFx0XHR0cmFuc2FjdGlvblZpZXcgPSBAcmVmc1tcInRyYW5zYWN0aW9uVmlldyN7aW5kZXh9XCJdXG5cdFx0XHRAc3RhdGUudHJhbnNhY3Rpb25zW2luZGV4XSA9IHRyYW5zYWN0aW9uVmlldy5nZXRUcmFuc2FjdGlvbk9iaigpXG5cdFx0QGZvcmNlVXBkYXRlKClcblx0c2V0VHJhbnNhY3Rpb25zOiAodHJhbnNhY3Rpb25zKSAtPlxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbnM6IHRyYW5zYWN0aW9ucylcblxuXHRvbkFkZFRyYW5zYWN0aW9uQ2xpY2s6IC0+XG5cdFx0bmV3VHJhbnNhY3Rpb24gPSBAbWFrZUVtcHR5VHJhbnNhY3Rpb24oKVxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMucHVzaChuZXdUcmFuc2FjdGlvbilcblx0XHRAZm9yY2VVcGRhdGUoKVxuXHRvbk9wdGltaXplQ2xpY2s6IC0+XG5cdFx0QGNvbGxlY3RUcmFuc2FjdGlvbnMoKVxuXHRcdEBwcm9wcy5vbkxlZGdlclN1Ym1pdChAc3RhdGUudHJhbnNhY3Rpb25zKVxuXHRvblJlc2V0Q2xpY2s6IC0+XG5cdFx0QHNldFN0YXRlKEBnZXRJbml0aWFsU3RhdGUoKSlcblx0b25UcmFuc2FjdGlvbkRlbGV0ZTogKGluZGV4KSAtPlxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMuc3BsaWNlKGluZGV4LCAxKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cblx0cmVuZGVyOiAtPlxuXHRcdHRyYW5zYWN0aW9uVmlld3MgPSBAc3RhdGUudHJhbnNhY3Rpb25zLm1hcCgodHJhbnNhY3Rpb24sIGluZGV4KSA9PlxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChMZWRnZXJUcmFuc2FjdGlvblZpZXcsIHsgIFxcXG5cdFx0XHRcdFwidHJhbnNhY3Rpb25PYmpcIjogKHRyYW5zYWN0aW9uKSwgIFxcXG5cdFx0XHRcdFwib25EZWxldGVcIjogKD0+IEBvblRyYW5zYWN0aW9uRGVsZXRlKGluZGV4KSksICBcXFxuXHRcdFx0XHRcInJlZlwiOiAoXCJ0cmFuc2FjdGlvblZpZXcje2luZGV4fVwiKSwgIFxcXG5cdFx0XHRcdFwia2V5XCI6IChpbmRleCl9KVxuXHRcdClcblx0XHRyZXR1cm4gKFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJyb3dcIiwgXCJzdHlsZVwiOiAoe21hcmdpblRvcDogJzEwcHgnfSl9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImNvbC1zbS0xMiBsZWRnZXItY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwibGVkZ2VyLWFjdGlvbnNcIn0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaDRcIiwge1wiY2xhc3NOYW1lXCI6IFwidGV4dC1sZWZ0XCJ9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdExlZGdlciBcblwiXCJcIiksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvbkFkZFRyYW5zYWN0aW9uQ2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRBZGQgVHJhbnNhY3Rpb25cblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tZGVmYXVsdFwiLCBcIm9uQ2xpY2tcIjogKEBvblJlc2V0Q2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRSZXNldFxuXCJcIlwiKSwgXHRcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIiwge1wiY2xhc3NOYW1lXCI6IFwiYnRuIGJ0bi1wcmltYXJ5XCIsIFwib25DbGlja1wiOiAoQG9uT3B0aW1pemVDbGljayl9LCBcIlwiXCJcblxcdFxcdFxcdFxcdFxcdFxcdFxcdE9wdGltaXplIVxuXCJcIlwiKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbnMtY29udGFpbmVyXCJ9LFxuXHRcdFx0XHRcdFx0KHRyYW5zYWN0aW9uVmlld3MpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KVxuIiwibW9kdWxlLmV4cG9ydHMgPVxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dXG5cdGdldEluaXRpYWxTdGF0ZTogLT5cblx0XHRkZWJ0b3I6ICcnXG5cdFx0Y3JlZGl0b3I6ICcnXG5cdFx0YW1vdW50OiAwXG5cdGNvbXBvbmVudFdpbGxNb3VudDogLT5cblx0XHRAc2V0VHJhbnNhY3Rpb25PYmooQHByb3BzLnRyYW5zYWN0aW9uT2JqKVxuXHRvblJlbW92ZUJ1dHRvbkNsaWNrOiAtPlxuXHRcdEBwcm9wcy5vbkRlbGV0ZSgpXG5cdGZvY3VzOiAtPlxuXHRcdFJlYWN0LmZpbmRET01Ob2RlKEByZWZzLmRlYnRvcklucHV0KS5mb2N1cygpXG5cdGdldFRyYW5zYWN0aW9uT2JqOiAtPlxuXHRcdHJldHVybiB7XG5cdFx0XHRkZWJ0b3I6IEBzdGF0ZS5kZWJ0b3Jcblx0XHRcdGNyZWRpdG9yOiBAc3RhdGUuY3JlZGl0b3Jcblx0XHRcdGFtb3VudDogcGFyc2VGbG9hdChAc3RhdGUuYW1vdW50KVxuXHRcdH1cblx0c2V0VHJhbnNhY3Rpb25PYmo6ICh0cmFuc2FjdGlvbk9iaikgLT5cblx0XHRAc2V0U3RhdGUoXG5cdFx0XHRkZWJ0b3I6IHRyYW5zYWN0aW9uT2JqWydkZWJ0b3InXVxuXHRcdFx0Y3JlZGl0b3I6IHRyYW5zYWN0aW9uT2JqWydjcmVkaXRvciddXG5cdFx0XHRhbW91bnQ6IHRyYW5zYWN0aW9uT2JqWydhbW91bnQnXS50b0ZpeGVkKDIpXG5cdFx0KVxuXHRyZW5kZXI6IC0+XG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImFcIiwge1wiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24tcmVtb3ZlLWJ1dHRvblwiLCBcIm9uQ2xpY2tcIjogKEBvblJlbW92ZUJ1dHRvbkNsaWNrKX0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHtcImNsYXNzTmFtZVwiOiBcImdseXBoaWNvbiBnbHlwaGljb24tbWludXNcIn0pXG5cdFx0XHQpLCBcdFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcblx0XHRcdFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG5cdFx0XHRcdFwicmVmXCI6IFwiZGVidG9ySW5wdXRcIiwgIFxcXG5cdFx0XHRcdFwidmFsdWVMaW5rXCI6IChAbGlua1N0YXRlKCdkZWJ0b3InKSl9KSwgXCJcIlwiXG5cXHRcXHRcXHQgb3dlcyBcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcblx0XHRcdFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG5cdFx0XHRcdFwidmFsdWVMaW5rXCI6IChAbGlua1N0YXRlKCdjcmVkaXRvcicpKX0pLCBcIlwiXCJcbiAgICAgICBhbiBhbW91bnQgb2YgJFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuICAgICAgXHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcbiAgICAgIFx0XCJpZFwiOiBcImFtb3VudElucHV0XCIsICAgXFxcbiAgICAgIFx0XCJwbGFjZWhvbGRlclwiOiBcIkFtb3VudFwiLCAgIFxcXG4gICAgICBcdFwidmFsdWVMaW5rXCI6IChAbGlua1N0YXRlKCdhbW91bnQnKSl9KVxuXHRcdCkiLCJBcHBWaWV3Q29udHJvbGxlciA9IHJlcXVpcmUgJy4vQXBwVmlld0NvbnRyb2xsZXIuY2pzeCdcblxuUmVhY3QucmVuZGVyKFxuICBSZWFjdC5jcmVhdGVFbGVtZW50KEFwcFZpZXdDb250cm9sbGVyLCBudWxsKSxcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxuKVxuIl19
