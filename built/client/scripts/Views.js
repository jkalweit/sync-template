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
                    isComplete: false
                };
                this.props.todos.set(todo.key, todo);
                this.setState({ newTodo: '' });
            }
        };
        Todos.prototype.handleTextChanged = function (e) {
            console.log('here2', e.target.value, e);
            this.setState({ newTodo: e.target.value });
        };
        Todos.prototype.render = function () {
            var _this = this;
            console.log('render');
            var nodes = Utils.toArray(this.props.todos).map(function (todo) {
                return (React.createElement("li", null, React.createElement("a", {"href": "#edit", "onClick": function () { _this.props.edit(todo); }}, todo.text)));
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
        function TodoEdit() {
            _super.apply(this, arguments);
        }
        TodoEdit.prototype.componentDidMount = function () {
        };
        TodoEdit.prototype.render = function () {
            var todo = (this.props.todo || {});
            return (React.createElement("div", {"data-role": "page", "id": "edit", "ref": "editpage"}, React.createElement("div", {"data-role": "header"}, React.createElement("h4", null, "Edit")), React.createElement("div", {"role": "main", "className": "ui-content"}, React.createElement("ul", {"data-role": "listview", "ref": "listview"}, React.createElement("li", {"data-role": "fieldcontain"}, React.createElement("label", null, "Name: ", React.createElement("input", {"type": "text", "value": todo.text}))), React.createElement("li", {"className": "ui-body ui-body-b"}, React.createElement("fieldset", {"className": "ui-grid-a"}, React.createElement("div", {"className": "ui-block-a"}, React.createElement("button", {"type": "submit", "data-theme": "d"}, "Cancel")), React.createElement("div", {"className": "ui-block-b"}, React.createElement("button", {"type": "submit", "data-theme": "a"}, "Submit")))))), React.createElement("div", {"data-role": "footer"}, React.createElement("h4", null, "-"))));
        };
        return TodoEdit;
    })(React.Component);
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
                _this.setState({ db: updated });
            });
            this.state = { db: data, selectedTodo: null };
        }
        Main.prototype.edit = function (todo) {
            this.setState({ selectedTodo: todo });
        };
        Main.prototype.render = function () {
            return (React.createElement("div", null, React.createElement(Todos, {"todos": this.state.db.todos, "edit": this.edit.bind(this)}), React.createElement(TodoEdit, {"todo": this.state.selectedTodo})));
        };
        return Main;
    })(React.Component);
    Views.Main = Main;
})(Views || (Views = {}));
React.initializeTouchEvents(true);
React.render(React.createElement(Views.Main, null), document.body);
//# sourceMappingURL=Views.js.map