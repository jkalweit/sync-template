/// <reference path="./typings/tsd.d.ts" />
/// <reference path="./Utils.ts" />
/// <reference path="./SyncNode.ts" />
/// <reference path="./SyncNodeSocket.ts" />
/// <reference path="./BaseViews.tsx" />

"use strict"

namespace Models {

	export interface Db extends SyncNode.ISyncNode {
		todos: {[key: string]: Todo}
	}
	export interface Todos {
		[key: string]: Todo;
	}
	export interface Todo extends SyncNode.ISyncNode {
		key: string;
		text: string;
		isComplete: boolean;
		todos: {[key: string]: Todo}
	}

}

namespace Views {

	interface TodosProps {
		todos: {[key: string]: Models.Todo}; 
		edit: (todo: Models.Todo) => void;
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
				var todo: Models.Todo = {
				key: new Date().toISOString(),
				text: e.target.value,
				isComplete: false,
				todos: {}
				};
				(this.props.todos as any).set(todo.key, todo);
				this.setState({ newTodo: '' });
			}
		}
		handleTextChanged(e: React.KeyboardEvent) {
			this.setState({ newTodo: (e.target as any).value });
		}
		render() {

			console.log('render');

			var nodes = Utils.toArray(this.props.todos).map((todo: Models.Todo) => {
			return (
				<li><a href="#edit" data-transition="slide" onClick={() => { this.props.edit(todo); }}>{todo.text}</a></li>
			       );
			});

			return ( 
					<div data-role="page" id="list" ref="listpage">
					<div data-role="header"><h4>Todos</h4></div>
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
		todo: Models.Todo; 
	}
	interface TodoEditState {
		mutable: Models.Todo;
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
		getMutableState(immutable: Models.Todo) {
			return { mutable: JSON.parse(JSON.stringify(immutable)) };
		}
		saveField(propName: string, e: React.FocusEvent) {
			this.props.todo.set(propName, (e.target as HTMLInputElement).value);	
		}	
		remove() {
			this.props.todo.parent.remove(this.props.todo.key);
			window.history.back();
		}
		render() {
			var mutable: Models.Todo = (this.state.mutable || {}) as Models.Todo
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
		selectedTodo?: Models.Todo;
	}
	export class Main extends React.Component<{}, MainState> {
		constructor(props: {}) {
			super(props);

			var data: Models.Db = { todos: {} };

			var sync = new SyncNodeSocket.SyncNodeSocket('todos', data);
			sync.onUpdated((updated: Models.Db) => {
				console.log('updated data!', updated);
				var newState: MainState = { db: updated };
				if(this.state.selectedTodo) newState.selectedTodo = updated.todos[this.state.selectedTodo.key];
				this.setState(newState);
			});

			this.state = { db: data, selectedTodo: null };
		}
		edit(todo: Models.Todo) {
			this.setState({ selectedTodo: todo });
		}
		render() {
			return ( 
					<div>	

					<Todos todos={this.state.db.todos} edit={this.edit.bind(this)} />
					
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
