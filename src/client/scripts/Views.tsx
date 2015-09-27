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
				isComplete: false
				};
				(this.props.todos as any).set(todo.key, todo);
				this.setState({ newTodo: '' });
			}
		}
		handleTextChanged(e: React.KeyboardEvent) {
			console.log('here2', (e.target as any).value, e);
			this.setState({ newTodo: (e.target as any).value });
		}
		render() {

			console.log('render');

			var nodes = Utils.toArray(this.props.todos).map((todo: Models.Todo) => {
			return (
				<li><a href="#edit" onClick={() => { this.props.edit(todo); }}>{todo.text}</a></li>
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
	export class TodoEdit extends React.Component<TodoEditProps, {}> {
		componentDidMount() {
		}
		render() {
			var todo: Models.Todo = (this.props.todo || {}) as Models.Todo
			return ( 
					<div data-role="page" id="edit" ref="editpage">
					<div data-role="header"><h4>Edit</h4></div>
					<div role="main" className="ui-content">
					<ul data-role="listview" ref="listview">	
					<li data-role="fieldcontain">
					<label>Name: <input type="text" value={todo.text} /></label>
					</li>
					<li className="ui-body ui-body-b">
					<fieldset className="ui-grid-a">
					<div className="ui-block-a"><button type="submit" data-theme="d">Cancel</button></div>
					<div className="ui-block-b"><button type="submit" data-theme="a">Submit</button></div>
					</fieldset>
					</li>
					</ul>
					</div>
					<div data-role="footer"><h4>-</h4></div>
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
				this.setState({ db: updated });
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
					<TodoEdit todo={this.state.selectedTodo} />

					</div>
			       );
		}
	}
}



React.initializeTouchEvents(true);
React.render(React.createElement(Views.Main, null), document.body);
