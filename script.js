class LocalStorageHandler {
    static getTodosFromLocalStorage() {
        const storedData = localStorage.getItem("todos")
        if (storedData) {
            return JSON.parse(storedData)
        }

        return []
    }

    static setTodosToLocalStorage() {
        localStorage.setItem("todos", JSON.stringify(app.todos))
    }
}

class TodoApp {
    constructor() {
        this.todos = []
        this.todo_title_input = document.querySelector(".todo-title-input")
        this.add_todo_btn = document.querySelector(".add-todo-btn")
        this.todos_container = document.querySelector(".todos-container")
    }

    init() {
        const storedTodos = LocalStorageHandler.getTodosFromLocalStorage()
        storedTodos.forEach(todo => this.todos.push(new TodoItem(todo)))
        DocumentManipulator.displayTodos()

        this.add_todo_btn.addEventListener("click", () => {
            if (this.todo_title_input.value.trim().length === 0) {
                alert("todo title is required")
                return
            }

            const currentTodo = new TodoItem({
                title: this.todo_title_input.value
            })
            currentTodo.pushToTodoList()
            this.todo_title_input.value = ""
        })
    }
}

class TodoItem {
    constructor({
        id = Date.now(),
        title,
        completed = false
    }) {
        this.id = id
        this.title = title
        this.completed = completed
    }

    pushToTodoList() {
        app.todos.push(this)
        DocumentManipulator.displayTodos()
        LocalStorageHandler.setTodosToLocalStorage()
    }

    removeFromTodoList() {
        if (confirm("Are you sure to delete this todo ?") == true) {
            const modifiedArray = app.todos.filter(todo => todo.id != this.id)
            app.todos = modifiedArray
            DocumentManipulator.displayTodos()
            LocalStorageHandler.setTodosToLocalStorage()
        }
    }

    toggleCompleteStatus() {
        this.completed = !this.completed
        DocumentManipulator.displayTodos()
        LocalStorageHandler.setTodosToLocalStorage()
    }

    editTodoItem() {
        const currentTodoElement = app.todos_container.querySelector(`.todo-item[data-id="${this.id}"]`)
        const todoTitle = currentTodoElement.querySelector(".todo-title")
        currentTodoElement.classList.add("being-edited")
        todoTitle.setAttribute("contentEditable", true)
        todoTitle.focus()
    }

    confirmTodoItemEdit() {
        const currentTodoElement = app.todos_container.querySelector(`.todo-item[data-id="${this.id}"]`)
        const todoTitle = currentTodoElement.querySelector(".todo-title")
        currentTodoElement.classList.remove("being-edited")
        todoTitle.setAttribute("contentEditable", false)

        for (let i = 0; i < app.todos.length; i++) {
            if (app.todos[i].id == this.id) {
                app.todos[i].title = todoTitle.textContent
                break
            }
        }

        DocumentManipulator.displayTodos()
        LocalStorageHandler.setTodosToLocalStorage()
    }
}

class DocumentManipulator {
    static displayTodos() {
        let htmlContentToRender = ""
        if (app.todos.length === 0) {
            htmlContentToRender = "<p class='no-items-alert'>nothing here, try to add some todos.</p>"
        } else {
            htmlContentToRender = app.todos.map(todo => `
                <div class="todo-item" data-id="${todo.id}">
                    <span class="complete-checkbox ${todo.completed ? "checked" : ""}"></span>
                    <p class="todo-title">${todo.title}</p>
                    <div class="todo-action-btns">
                        <button class="edit-todo-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                        <button class="delete-todo-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                        <button class="confirm-todo-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            `).join("")
        }

        app.todos_container.innerHTML = htmlContentToRender
        DocumentManipulator.initEventListeners()
    }

    static initEventListeners() {
        const toggleCompleteBtns = app.todos_container.querySelectorAll(".complete-checkbox")
        const deleteTodoBtns = app.todos_container.querySelectorAll(".delete-todo-btn")
        const editTodoBtns = app.todos_container.querySelectorAll(".edit-todo-btn")
        const confirmTodoBtns = app.todos_container.querySelectorAll(".confirm-todo-btn")

        toggleCompleteBtns.forEach(btn => btn.addEventListener("click", function () {
            const currentTodo = app.todos.find(todo => todo.id == this.closest(".todo-item").dataset.id)
            currentTodo.toggleCompleteStatus()
        }))
        deleteTodoBtns.forEach(btn => btn.addEventListener("click", function () {
            const currentTodo = app.todos.find(todo => todo.id == this.closest(".todo-item").dataset.id)
            currentTodo.removeFromTodoList()
        }))
        editTodoBtns.forEach(btn => btn.addEventListener("click", function () {
            const currentTodo = app.todos.find(todo => todo.id == this.closest(".todo-item").dataset.id)
            currentTodo.editTodoItem()
        }))
        confirmTodoBtns.forEach(btn => btn.addEventListener("click", function () {
            const currentTodo = app.todos.find(todo => todo.id == this.closest(".todo-item").dataset.id)
            currentTodo.confirmTodoItemEdit()
        }))
    }
}

const app = new TodoApp
app.init()
