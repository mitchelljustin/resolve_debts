(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LedgerEditorViewController;

LedgerEditorViewController = require('./LedgerEditorViewController.cjsx');

module.exports = React.createClass({displayName: "exports",
  onLedgerSubmit: function(ledgerObj) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21pdGNoL3NieC9yZXNvbHZlX2RlYnQvYXBwL3N0YXRpYy9zY3JpcHRzL0FwcFZpZXdDb250cm9sbGVyLmNqc3giLCIvVXNlcnMvbWl0Y2gvc2J4L3Jlc29sdmVfZGVidC9hcHAvc3RhdGljL3NjcmlwdHMvTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9MZWRnZXJUcmFuc2FjdGlvblZpZXcuY2pzeCIsIi9Vc2Vycy9taXRjaC9zYngvcmVzb2x2ZV9kZWJ0L2FwcC9zdGF0aWMvc2NyaXB0cy9pbmRleC5janN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQTs7QUFBQSwwQkFBQSxHQUE2QixPQUFBLENBQVEsbUNBQVI7O0FBRTdCLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsS0FBSyxDQUFDLFdBQU4sQ0FDQztFQUFBLGNBQUEsRUFBZ0IsU0FBQyxTQUFEO1dBQ2YsS0FDQyxDQUFDLElBREYsQ0FDTyxXQURQLEVBQ29CLFNBRHBCLENBRUMsQ0FBQyxJQUZGLENBRU8sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFdBQUQ7QUFDTCxZQUFBO1FBQUEsWUFBQSxHQUFlLFdBQVcsQ0FBQyxJQUFLLENBQUEsY0FBQTtlQUNoQyxLQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFuQixDQUFtQyxZQUFuQztNQUZLO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZQLENBTUMsQ0FBQyxPQUFELENBTkQsQ0FNUSxPQUFPLENBQUMsR0FOaEI7RUFEZSxDQUFoQjtFQVFBLE1BQUEsRUFBUSxTQUFBO1dBQ1AsS0FBSyxDQUFD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QVQsQ0FBOEIsTUFBOUIsQ0FBc0MsQ0FBQSxDQUFBLENBRnhDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkxlZGdlckVkaXRvclZpZXdDb250cm9sbGVyID0gcmVxdWlyZSAnLi9MZWRnZXJFZGl0b3JWaWV3Q29udHJvbGxlci5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0b25MZWRnZXJTdWJtaXQ6IChsZWRnZXJPYmopIC0+XG5cdFx0YXhpb3Ncblx0XHRcdC5wb3N0KCcvb3B0aW1pemUnLCBsZWRnZXJPYmopXG5cdFx0XHQudGhlbigocmVzcG9uc2VPYmopID0+XG5cdFx0XHRcdHRyYW5zYWN0aW9ucyA9IHJlc3BvbnNlT2JqLmRhdGFbJ3RyYW5zYWN0aW9ucyddXG5cdFx0XHRcdEByZWZzLmxlZGdlckVkaXRvci5zZXRUcmFuc2FjdGlvbnModHJhbnNhY3Rpb25zKVxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKGNvbnNvbGUuZXJyKVxuXHRyZW5kZXI6IC0+XG5cdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb250YWluZXJcIn0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcInJvdyBjb2wtc20tMTJcIn0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJoM1wiLCB7XCJjbGFzc05hbWVcIjogXCJ0ZXh0LWNlbnRlclwifSwgXCIgTXVEZWx0YSBcIiksXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwXCIsIG51bGwsIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0RW50ZXIgZGVidHMgYmV0d2VlbiBwZW9wbGUgYW5kIHRoZW4gaGl0IE9wdGltaXplIHRvIHJ1biB0aGUgdHJhbnNhY3Rpb24gb3B0aW1pemVyIVxuXCJcIlwiKSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyRWRpdG9yVmlld0NvbnRyb2xsZXIsIHsgXFxcblx0XHRcdFx0XHRcdFwicmVmXCI6IFwibGVkZ2VyRWRpdG9yXCIsICBcXFxuXHRcdFx0XHRcdFx0XCJvbkxlZGdlclN1Ym1pdFwiOiAoQG9uTGVkZ2VyU3VibWl0KVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCkiLCJMZWRnZXJUcmFuc2FjdGlvblZpZXcgPSByZXF1aXJlICcuL0xlZGdlclRyYW5zYWN0aW9uVmlldy5janN4J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuUmVhY3QuY3JlYXRlQ2xhc3Ncblx0Z2V0SW5pdGlhbFN0YXRlOiAtPlxuXHRcdHJldHVybiB7XG5cdFx0XHRcdHRyYW5zYWN0aW9uczogW1xuXHRcdFx0XHRcdEBtYWtlRW1wdHlUcmFuc2FjdGlvbigpXG5cdFx0XHRcdF1cblx0XHR9XG5cdG1ha2VFbXB0eVRyYW5zYWN0aW9uOiAtPiB7XG5cdFx0ZGVidG9yOiAnJ1xuXHRcdGNyZWRpdG9yOiAnJ1xuXHRcdGFtb3VudDogMFxuXHR9XG5cdHNldFRyYW5zYWN0aW9uczogKHRyYW5zYWN0aW9ucykgLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb25zOiB0cmFuc2FjdGlvbnMpXG5cblx0b25BZGRUcmFuc2FjdGlvbkNsaWNrOiAtPlxuXHRcdG5ld1RyYW5zYWN0aW9uID0gQG1ha2VFbXB0eVRyYW5zYWN0aW9uKClcblx0XHRAc3RhdGUudHJhbnNhY3Rpb25zLnB1c2gobmV3VHJhbnNhY3Rpb24pXG5cdFx0QGZvcmNlVXBkYXRlKClcblx0b25PcHRpbWl6ZUNsaWNrOiAtPlxuXHRcdEBwcm9wcy5vbkxlZGdlclN1Ym1pdChAc3RhdGUudHJhbnNhY3Rpb25zKVxuXHRvblJlc2V0Q2xpY2s6IC0+XG5cdFx0QHNldFN0YXRlKEBnZXRJbml0aWFsU3RhdGUoKSlcblx0b25UcmFuc2FjdGlvbkRlbGV0ZTogKGluZGV4KSAtPlxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnMuc3BsaWNlKGluZGV4LCAxKVxuXHRcdEBmb3JjZVVwZGF0ZSgpXG5cdG9uVHJhbnNhY3Rpb25DaGFuZ2VkOiAodHJhbnNhY3Rpb24sIGluZGV4KSAtPlxuXHRcdEBzdGF0ZS50cmFuc2FjdGlvbnNbaW5kZXhdID0gdHJhbnNhY3Rpb25cblx0XHRAZm9yY2VVcGRhdGUoKVxuXG5cdHJlbmRlcjogLT5cblx0XHR0cmFuc2FjdGlvblZpZXdzID0gQHN0YXRlLnRyYW5zYWN0aW9ucy5tYXAoKHRyYW5zYWN0aW9uLCBpbmRleCkgPT5cblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGVkZ2VyVHJhbnNhY3Rpb25WaWV3LCB7ICBcXFxuXHRcdFx0XHRcInRyYW5zYWN0aW9uXCI6ICh0cmFuc2FjdGlvbiksICBcXFxuXHRcdFx0XHRcIm9uRGVsZXRlXCI6ICg9PiBAb25UcmFuc2FjdGlvbkRlbGV0ZShpbmRleCkpLCAgXFxcblx0XHRcdFx0XCJvblRyYW5zYWN0aW9uQ2hhbmdlZFwiOiAoKG5ld1R4KSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQobmV3VHgsIGluZGV4KSksICBcXFxuXHRcdFx0XHRcImtleVwiOiAoaW5kZXgpfSlcblx0XHQpXG5cdFx0cmV0dXJuIChcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwicm93XCIsIFwic3R5bGVcIjogKHttYXJnaW5Ub3A6ICcxMHB4J30pfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7XCJjbGFzc05hbWVcIjogXCJjb2wtc20tMTIgbGVkZ2VyLWNvbnRhaW5lclwifSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzTmFtZVwiOiBcImxlZGdlci1hY3Rpb25zXCJ9LFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImg0XCIsIHtcImNsYXNzTmFtZVwiOiBcInRleHQtbGVmdFwifSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRMZWRnZXIgXG5cIlwiXCIpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJvbkNsaWNrXCI6IChAb25BZGRUcmFuc2FjdGlvbkNsaWNrKX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0QWRkIFRyYW5zYWN0aW9uXG5cIlwiXCIpLCBcdFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiLCB7XCJjbGFzc05hbWVcIjogXCJidG4gYnRuLWRlZmF1bHRcIiwgXCJvbkNsaWNrXCI6IChAb25SZXNldENsaWNrKX0sIFwiXCJcIlxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0UmVzZXRcblwiXCJcIiksIFx0XG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIsIHtcImNsYXNzTmFtZVwiOiBcImJ0biBidG4tcHJpbWFyeVwiLCBcIm9uQ2xpY2tcIjogKEBvbk9wdGltaXplQ2xpY2spfSwgXCJcIlwiXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRPcHRpbWl6ZSFcblwiXCJcIilcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb25zLWNvbnRhaW5lclwifSxcblx0XHRcdFx0XHRcdCh0cmFuc2FjdGlvblZpZXdzKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdClcbiIsIm1vZHVsZS5leHBvcnRzID1cblJlYWN0LmNyZWF0ZUNsYXNzXG5cdGNvbXBvbmVudFdpbGxNb3VudDogLT5cblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IEBwcm9wcy50cmFuc2FjdGlvbilcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogKG5ld1Byb3BzKSAtPlxuXHRcdEBzZXRTdGF0ZSh0cmFuc2FjdGlvbjogbmV3UHJvcHMudHJhbnNhY3Rpb24pXG5cblx0b25SZW1vdmVCdXR0b25DbGljazogLT5cblx0XHRAcHJvcHMub25EZWxldGUoKVxuXHRvblRyYW5zYWN0aW9uQ2hhbmdlZDogKGtleSwgZSkgLT5cblx0XHR0cmFuc2FjdGlvbiA9IEBzdGF0ZS50cmFuc2FjdGlvblxuXHRcdG5ld1ZhbHVlID0gZS50YXJnZXQudmFsdWVcblx0XHR0cmFuc2FjdGlvbltrZXldID0gbmV3VmFsdWVcblx0XHRAc2V0U3RhdGUodHJhbnNhY3Rpb246IHRyYW5zYWN0aW9uKVxuXHRcdEBwcm9wcy5vblRyYW5zYWN0aW9uQ2hhbmdlZChAc3RhdGUudHJhbnNhY3Rpb24pXG5cblx0cmVuZGVyOiAtPlxuXHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiwgbnVsbCxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJhXCIsIHtcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLXJlbW92ZS1idXR0b25cIiwgXCJvbkNsaWNrXCI6IChAb25SZW1vdmVCdXR0b25DbGljayl9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFwiaVwiLCB7XCJjbGFzc05hbWVcIjogXCJnbHlwaGljb24gZ2x5cGhpY29uLW1pbnVzXCJ9KVxuXHRcdFx0KSwgXHRcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiLCB7XCJ0eXBlXCI6IFwidGV4dFwiLCAgIFxcXG5cdFx0XHRcdFwiY2xhc3NOYW1lXCI6IFwidHJhbnNhY3Rpb24taW5wdXRcIiwgICBcXFxuXHRcdFx0XHRcInJlZlwiOiBcImRlYnRvcklucHV0XCIsICBcXFxuXHRcdFx0XHRcInZhbHVlXCI6IChAc3RhdGUudHJhbnNhY3Rpb24uZGVidG9yKSwgIFxcXG5cdFx0XHRcdFwib25DaGFuZ2VcIjogKChlKSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQoJ2RlYnRvcicsIGUpKX0pLCBcIlwiXCJcblxcdFxcdFxcdCBvd2VzIFxuXCJcIlwiLCBSZWFjdC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiwge1widHlwZVwiOiBcInRleHRcIiwgICBcXFxuXHRcdFx0XHRcImNsYXNzTmFtZVwiOiBcInRyYW5zYWN0aW9uLWlucHV0XCIsICAgXFxcblx0XHRcdFx0XCJ2YWx1ZVwiOiAoQHN0YXRlLnRyYW5zYWN0aW9uLmNyZWRpdG9yKSwgIFxcXG5cdFx0XHRcdFwib25DaGFuZ2VcIjogKChlKSA9PiBAb25UcmFuc2FjdGlvbkNoYW5nZWQoJ2NyZWRpdG9yJywgZSkpfSksIFwiXCJcIlxuICAgICAgIGFuIGFtb3VudCBvZiBcblwiXCJcIiwgUmVhY3QuY3JlYXRlRWxlbWVudChcImlucHV0XCIsIHtcInR5cGVcIjogXCJ0ZXh0XCIsICAgXFxcbiAgICAgIFx0XCJjbGFzc05hbWVcIjogXCJ0cmFuc2FjdGlvbi1pbnB1dFwiLCAgIFxcXG4gICAgICBcdFwidmFsdWVcIjogKEBzdGF0ZS50cmFuc2FjdGlvbi5hbW91bnQpLCAgXFxcbiAgICAgIFx0XCJvbkNoYW5nZVwiOiAoKGUpID0+IEBvblRyYW5zYWN0aW9uQ2hhbmdlZCgnYW1vdW50JywgZSkpfSlcblx0XHQpIiwiQXBwVmlld0NvbnRyb2xsZXIgPSByZXF1aXJlICcuL0FwcFZpZXdDb250cm9sbGVyLmNqc3gnXG5cblJlYWN0LnJlbmRlcihcbiAgUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3Q29udHJvbGxlciwgbnVsbCksXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cbilcbiJdfQ==
