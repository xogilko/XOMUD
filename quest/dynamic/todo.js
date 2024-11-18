//JS PORTION

(() => {
    if (!lain.profile.testkit_todo) {
        lain.profile.testkit_todo = {};
    }

    function addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text) {
            const todoId = Date.now().toString();
            lain.profile.testkit_todo[todoId] = {
                text: text,
                complete: false
            };
            input.value = '';
            refreshTodoList();
        }
    }

    function toggleTodo(todoId) {
        lain.profile.testkit_todo[todoId].complete = !lain.profile.testkit_todo[todoId].complete;
        refreshTodoList();
    }

    function clearCompleted() {
        Object.entries(lain.profile.testkit_todo).forEach(([id, todo]) => {
            if (todo.complete) {
                delete lain.profile.testkit_todo[id];
            }
        });
        refreshTodoList();
    }

    function refreshTodoList() {
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        
        const sortedTodos = Object.entries(lain.profile.testkit_todo).sort(([,a], [,b]) => {
            if (a.complete === b.complete) return 0;
            return a.complete ? 1 : -1;
        });
        
        sortedTodos.forEach(([id, todo]) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <label ${todo.complete ? 'style="text-decoration: line-through;"' : ''}>
                    <input type="checkbox" 
                           ${todo.complete ? 'checked' : ''} 
                           onclick="toggleTodo('${id}')">
                    ${todo.text}
                </label>
            `;
            todoList.appendChild(li);
        });
    }

    window.addTodo = addTodo;
    window.toggleTodo = toggleTodo;
    window.clearCompleted = clearCompleted;
    window.refreshTodoList = refreshTodoList;

    refreshTodoList();
})();

//HTML PORTION

<div class="testkit_todo_container">
    <b>Todo List</b>
    <div class="todo-input">
        <input type="text" id="todoInput" placeholder="Enter a new todo">
        <button onclick="addTodo()">Add</button>
        <button onclick="refreshTodoList()">Refresh</button>
        <button onclick="clearCompleted()">Clear</button>
    </div>
    <ul id="todoList"></ul>
</div>

