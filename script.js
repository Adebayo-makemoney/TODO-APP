// DOM Elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let searchTerm = '';

// Initialize the app
function init() {
    renderTodos();
    addEventListeners();
}

// Add event listeners
function addEventListeners() {
    addBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderTodos();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoInput.focus();
}

// Toggle todo completion status
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
}

// Edit a todo
function editTodo(id, newText) {
    if (newText.trim() === '') return;
    
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: newText.trim() };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Filter and search todos
function getFilteredTodos() {
    return todos.filter(todo => {
        const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
        const matchesFilter = 
            currentFilter === 'all' || 
            (currentFilter === 'active' && !todo.completed) ||
            (currentFilter === 'completed' && todo.completed);
        
        return matchesSearch && matchesFilter;
    });
}

// Render todos to the DOM
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>${searchTerm || currentFilter !== 'all' ? 'No tasks match your criteria.' : 'No tasks found. Add a new task to get started!'}</p>
            </div>
        `;
    } else {
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');
        
        addTodoItemEventListeners();
    }
    
    updateStats();
}

// Add event listeners to todo items
function addTodoItemEventListeners() {
    // Checkbox event listeners
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.target.closest('.todo-item').dataset.id);
            toggleTodo(id);
        });
    });
    
    // Edit button event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            const id = parseInt(todoItem.dataset.id);
            const todoText = todoItem.querySelector('.todo-text');
            const currentText = todoText.textContent;
            
            const newText = prompt('Edit your task:', currentText);
            if (newText !== null) {
                editTodo(id, newText);
            }
        });
    });
    
    // Delete button event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.todo-item').dataset.id);
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTodo(id);
            }
        });
    });
}

// Update statistics
function updateStats() {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    
    totalTasksEl.textContent = `Total: ${totalTasks}`;
    completedTasksEl.textContent = `Completed: ${completedTasks}`;
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);