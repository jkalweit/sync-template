/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Utils.ts" />
/// <reference path="./SyncNode.ts" />
/// <reference path="./SyncNodeSocket.ts" />
/// <reference path="./BaseViews.tsx" />

"use strict"

namespace Models {

	export interface Db extends SyncNode.ISyncNode {
		lists: {[key: string]: TodoList}
	}
	export interface TodoList extends SyncNode.ISyncNode {
		key: string;
		text: string;
		todos: {[key: string]: TodoItem}
	}
	export interface TodoItem extends SyncNode.ISyncNode {
		key: string;
		text: string;
		isComplete: boolean;
	}

}

namespace Views {


	interface TodoListsProps {
		lists: {[key: string]: Models.TodoList}; 
		edit: (list: Models.TodoList) => void;
	}
	interface TodoListsState {
		newList: string;
	}
	export class TodoLists extends BaseViews.SyncView<TodoListsProps, TodoListsState> {
		componentDidUpdate() {
			var domNode = React.findDOMNode(this.refs['listview']);
			$(domNode)['listview']('refresh');
		}
		handleKeyUp(element: any, e: any) {
			if (e.keyCode === 13) {
				var todoList: Models.TodoList = {
				key: new Date().toISOString(),
				text: e.target.value,
				todos: {}
				};
				(this.props.lists as any).set(todoList.key, todoList);
				this.setState({ newList: '' });
			}
		}
		handleTextChanged(e: React.KeyboardEvent) {
			this.setState({ newList: (e.target as any).value });
		}
		render() {

			console.log('render TodoLists');

			var nodes = Utils.toArray(this.props.lists).map((list: Models.TodoList) => {
			return (
				<li><a href="#editlist" data-transition="slide" onClick={() => { this.props.edit(list); }}>{list.text || '-'}</a></li>
			       );
			});

			return ( 
					<div data-role="page" id="list" ref="listpage">
					<div data-role="header">
						<h4>Todo Lists</h4>
					</div>
					<div role="main" className="ui-content">
					<ul data-role="listview" ref="listview">
					<input type="text" value={this.state.newList} 
					onChange={this.handleTextChanged.bind(this)}
					ref={(el) => {
						var input = (React.findDOMNode(el) as any);
						if(input) {
							input.focus();
							input['onkeyup'] = (e: any) => { this.handleKeyUp(input, e); };
						}
					}} />
					{ nodes }
					</ul>
					</div>
					<div data-role="footer"><h4>-</h4></div>
					</div>
			       );
		}
	}




	interface TodosProps {
		list: Models.TodoList;
		edit: (todo: Models.TodoItem) => void;
	}
	interface TodosState {
		newTodo: string;
	}
	export class Todos extends BaseViews.SyncView<TodosProps, TodosState> {
		componentDidUpdate() {
			var domNode = React.findDOMNode(this.refs['listview']);
			$(domNode)['listview']('refresh');
		}
		handleKeyUp(element: any, e: any) {
			if (e.keyCode === 13) {
				var todo: Models.TodoItem = {
				key: new Date().toISOString(),
				text: e.target.value,
				isComplete: false
				};
				(this.props.list.todos as any).set(todo.key, todo);
				this.setState({ newTodo: '' });
			}
		}
		handleTextChanged(e: React.KeyboardEvent) {
			this.setState({ newTodo: (e.target as any).value });
		}
		remove() {
			if(confirm('Delete list: "' + this.props.list.text + '"?')) {
				this.props.list.parent.remove(this.props.list.key);
				window.history.back();
			}
		}

		render() {

			console.log('render');

			var nodes = Utils.toArray(this.props.list.todos).map((todo: Models.TodoItem) => {
			return (
				<li><a href="#edit" data-transition="slide" onClick={() => { this.props.edit(todo); }}>{todo.text}</a></li>
			       );
			});

			return ( 
					<div data-role="page" id="editlist" ref="listpage">
					<div data-role="header">
						<a href="#" data-rel="back" data-direction="reverse" className="ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-left ui-icon-back">Back</a>
						<h4>{this.props.list.text || '-'}</h4>
						<button onClick={this.remove.bind(this)} className="ui-btn-right ui-btn ui-btn-b ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right ui-icon-delete">Delete</button>
					</div>
					<div role="main" className="ui-content">
					<ul data-role="listview" ref="listview">
					<input type="text" value={this.state.newTodo} 
					onChange={this.handleTextChanged.bind(this)}
					ref={(el) => {
						var input = (React.findDOMNode(el) as any);
						if(input) {
							input.focus();
							input['onkeyup'] = (e: any) => { this.handleKeyUp(input, e); };
						}
					}} />
					{ nodes }
					</ul>
					</div>
					<div data-role="footer"><h4>-</h4></div>
					</div>
			       );
		}
	}


	interface TodoEditProps {
		todo: Models.TodoItem; 
	}
	interface TodoEditState {
		mutable: Models.TodoItem;
	}
	export class TodoEdit extends BaseViews.SyncView<TodoEditProps, TodoEditState> {
		constructor(props: TodoEditProps) {
			super(props);
			this.state = this.getMutableState(props.todo);
		}
		componentWillReceiveProps(nextProps: TodoEditProps) {
			console.log('nextProps', nextProps);
			this.setState(this.getMutableState(nextProps.todo));
		}
		getMutableState(immutable: Models.TodoItem) {
			return { mutable: JSON.parse(JSON.stringify(immutable)) };
		}
		saveField(propName: string, e: React.FocusEvent) {
			this.props.todo.set(propName, (e.target as HTMLInputElement).value);	
		}
		componentDidUpdate() {
			var domNode = React.findDOMNode(this.refs['listview']);
			$(domNode)['listview']('refresh');
		}
		remove() {
			this.props.todo.parent.remove(this.props.todo.key);
			window.history.back();
		}
		render() {
			var mutable: Models.TodoItem = (this.state.mutable || {}) as Models.TodoItem
			return ( 
					<div data-role="page" id="edit" ref="editpage">
					<div data-role="header">
						<a href="#" data-rel="back" data-direction="reverse" className="ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-left ui-icon-back">Back</a>
						<h4>Edit</h4>
						<button onClick={this.remove.bind(this)} className="ui-btn-right ui-btn ui-btn-b ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right ui-icon-delete">Delete</button>
					</div>
					<div role="main" className="ui-content">
					<ul data-role="listview" ref="listview">	
					<li data-role="fieldcontain">
					<label>Name: <input type="text" onBlur={this.saveField.bind(this, 'text')} value={mutable.text} onChange={this.handleChange.bind(this, 'mutable', 'text')} /></label>
					</li>
					</ul>
					</div>
					</div>
			       );
		}
	}





	interface MainState {
		db?: Models.Db;
		selectedList?: Models.TodoList;
		selectedTodo?: Models.TodoItem;
	}
	export class Main extends React.Component<{}, MainState> {
		constructor(props: {}) {
			super(props);

			var data: Models.Db = { lists: {} };

			var sync = new SyncNodeSocket.SyncNodeSocket('todos', data);
			sync.onUpdated((updated: Models.Db) => {
				console.log('updated data!', updated);
				var newState: MainState = { db: updated };
				if(this.state.selectedList) newState.selectedList = updated.lists[this.state.selectedList.key];
				if(!newState.selectedList) { 
					newState.selectedTodo = null;
				} else if(this.state.selectedTodo) {
					newState.selectedTodo = newState.selectedList.todos[this.state.selectedTodo.key];
				}
				this.setState(newState);
			});

			this.state = { db: data, selectedTodo: null };
		}
		editList(list: Models.TodoList) {
			this.setState({ selectedList: list });
		}
		editItem(todo: Models.TodoItem) {
			this.setState({ selectedTodo: todo });
		}
		render() {
			return ( 
					<div>	

					<TodoLists lists={this.state.db.lists} edit={this.editList.bind(this)} />
				
					{ this.state.selectedList ? 
					<Todos list={this.state.selectedList} edit={this.editItem.bind(this)} />
					: null }
						
					{ this.state.selectedTodo ? 
					<TodoEdit todo={this.state.selectedTodo} />
					: null }
					
					</div>
			       );
		}
	}
}


$(document).bind("mobileinit", function(){
       	// $.mobile.defaultPageTransition = 'slide';
});


React.initializeTouchEvents(true);
React.render(React.createElement(Views.Main, null), document.body);
