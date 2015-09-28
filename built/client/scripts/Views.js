/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Utils.ts" />
/// <reference path="./SyncNode.ts" />
/// <reference path="./SyncNodeSocket.ts" />
/// <reference path="./BaseViews.tsx" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Views;
(function (Views) {
    var Todos = (function (_super) {
        __extends(Todos, _super);
        function Todos() {
            _super.apply(this, arguments);
        }
        Todos.prototype.componentDidUpdate = function () {
            var domNode = React.findDOMNode(this.refs['listview']);
            $(domNode)['listview']('refresh');
        };
        Todos.prototype.handleKeyUp = function (element, e) {
            if (e.keyCode === 13) {
                var todo = {
                    key: new Date().toISOString(),
                    text: e.target.value,
                    isComplete: false,
                    todos: {}
                };
                this.props.todos.set(todo.key, todo);
                this.setState({ newTodo: '' });
            }
        };
        Todos.prototype.handleTextChanged = function (e) {
            this.setState({ newTodo: e.target.value });
        };
        Todos.prototype.render = function () {
            var _this = this;
            console.log('render');
            var nodes = Utils.toArray(this.props.todos).map(function (todo) {
                return (React.createElement("li", null, React.createElement("a", {"href": "#edit", "data-transition": "slide", "onClick": function () { _this.props.edit(todo); }}, todo.text)));
            });
            return (React.createElement("div", {"data-role": "page", "id": "list", "ref": "listpage"}, React.createElement("div", {"data-role": "header"}, React.createElement("h4", null, "Todos")), React.createElement("div", {"role": "main", "className": "ui-content"}, React.createElement("ul", {"data-role": "listview", "ref": "listview"}, React.createElement("input", {"type": "text", "value": this.state.newTodo, "onChange": this.handleTextChanged.bind(this), "ref": function (el) {
                var input = React.findDOMNode(el);
                if (input) {
                    input.focus();
                    input['onkeyup'] = function (e) { _this.handleKeyUp(input, e); };
                }
            }}), nodes)), React.createElement("div", {"data-role": "footer"}, React.createElement("h4", null, "-"))));
        };
        return Todos;
    })(BaseViews.SyncView);
    Views.Todos = Todos;
    var TodoEdit = (function (_super) {
        __extends(TodoEdit, _super);
        function TodoEdit(props) {
            _super.call(this, props);
            this.state = this.getMutableState(props.todo);
        }
        TodoEdit.prototype.componentWillReceiveProps = function (nextProps) {
            console.log('nextProps', nextProps);
            this.setState(this.getMutableState(nextProps.todo));
        };
        TodoEdit.prototype.getMutableState = function (immutable) {
            return { mutable: JSON.parse(JSON.stringify(immutable)) };
        };
        TodoEdit.prototype.saveField = function (propName, e) {
            this.props.todo.set(propName, e.target.value);
        };
        TodoEdit.prototype.remove = function () {
            this.props.todo.parent.remove(this.props.todo.key);
            window.history.back();
        };
        TodoEdit.prototype.render = function () {
            var mutable = (this.state.mutable || {});
            return (React.createElement("div", {"data-role": "page", "id": "edit", "ref": "editpage"}, React.createElement("div", {"data-role": "header"}, React.createElement("a", {"href": "#", "data-rel": "back", "data-direction": "reverse", "className": "ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-left ui-icon-back"}, "Back"), React.createElement("h4", null, "Edit"), React.createElement("button", {"onClick": this.remove.bind(this), "className": "ui-btn-right ui-btn ui-btn-b ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right ui-icon-delete"}, "Delete")), React.createElement("div", {"role": "main", "className": "ui-content"}, React.createElement("ul", {"data-role": "listview", "ref": "listview"}, React.createElement("li", {"data-role": "fieldcontain"}, React.createElement("label", null, "Name: ", React.createElement("input", {"type": "text", "onBlur": this.saveField.bind(this, 'text'), "value": mutable.text, "onChange": this.handleChange.bind(this, 'mutable', 'text')})))))));
        };
        return TodoEdit;
    })(BaseViews.SyncView);
    Views.TodoEdit = TodoEdit;
    var Main = (function (_super) {
        __extends(Main, _super);
        function Main(props) {
            var _this = this;
            _super.call(this, props);
            var data = { todos: {} };
            var sync = new SyncNodeSocket.SyncNodeSocket('todos', data);
            sync.onUpdated(function (updated) {
                console.log('updated data!', updated);
                var newState = { db: updated };
                if (_this.state.selectedTodo)
                    newState.selectedTodo = updated.todos[_this.state.selectedTodo.key];
                _this.setState(newState);
            });
            this.state = { db: data, selectedTodo: null };
        }
        Main.prototype.edit = function (todo) {
            this.setState({ selectedTodo: todo });
        };
        Main.prototype.render = function () {
            return (React.createElement("div", null, React.createElement(Todos, {"todos": this.state.db.todos, "edit": this.edit.bind(this)}), this.state.selectedTodo ?
                React.createElement(TodoEdit, {"todo": this.state.selectedTodo})
                : null));
        };
        return Main;
    })(React.Component);
    Views.Main = Main;
})(Views || (Views = {}));
$(document).bind("mobileinit", function () {
    // $.mobile.defaultPageTransition = 'slide';
});
React.initializeTouchEvents(true);
React.render(React.createElement(Views.Main, null), document.body);
//# sourceMappingURL=Views.js.map