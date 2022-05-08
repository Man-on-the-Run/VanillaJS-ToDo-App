class Todo {
    constructor(task) {
        this.task = task;
        this.completed = false;
    }
}

//State//
let todos;
let records = [];
let userClickedUndo = false;
let steps = 0;

// Init //
if (!localStorage.getItem('todos')) {
    localStorage.setItem('todos', JSON.stringify([]));
}

todos = JSON.parse(localStorage.getItem('todos'));
records.push(copyOf(todos));
log();

//CRUD
function add({ todo }) {
    todos.push(todo);
}

function remove({ index }) {
    todos.splice(index, 1);
}

function edit({ index, editedTask }) {
    todos[index].task = editedTask;
}

function toggleCompleted({ index }) {
    todos[index].completed = !todos[index].completed;
}

function clearAll() {
    todos = [];
}

function markAll({ option }) {
    todos.forEach(todo => {
        todo.completed = option;
    });
}

// Sync state w/ UI//

function sync() {
    save(todos);
    render();
    log();
}

function setState(callback, params) {
    if (userClickedUndo) {
        updateHistory(todos);
        userClickedUndo = false;
        steps = 0;
    }
    callback(params);
    updateHistory(todos);
    sync();
}

function batchEdit(callback, params) {
    if (todos.length === 0) {
        notifyUser('Can\' t perform any action on an empty list');
        return;
    } else if(callback.name === 'clearAll') {
        if(!confirm('Are you sure?')) {
            return;
        }
    }
    setState(callback, params);
}



// Undo-Redo //
function undo() {
    const previousState = records.length - 2;
    if (previousState - steps < 0) {
        notifyUser('Nothing to undo');
        return;
    }
    userClickedUndo = true;
    todos = copyOf(records[previousState - steps]);
    steps++;
    sync();
}

function redo() {
    const latestAddedState = records.length - 1;
    if (steps === 0) {
        userClickedUndo = false;
        notifyUser('Nothing to redo');
        return;
    }
    todos = copyOf(records[latestAddedState - steps + 1]);
    steps--;
    sync();
}

//Render//
function render() {
    list.innerHTML = '';
    todos.forEach(todo => {
        display(todo);
    });

    counterDisplay.textContent = todos.length;

    completedDisplay.textContent = todos.filter(todo => {
        return todo.completed === true;
    }).length;
}

function display(todo) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    const textSpan = document.createElement('span');
    const removeSpan = document.createElement('span');

    checkbox.checked = todo.completed;
    textSpan.textContent = todo.task;
    removeSpan.innerHTML = '×';

    li.addEventListener('click', function (e) {
        const index = Array.from(this.parentElement.children).indexOf(this);

        switch (e.target) {
            case checkbox:
                setState(toggleCompleted, {
                    index: index
                })
                break;
            case textSpan:
                const editedTask = prompt('Edit Task');
                if (!editedTask) {
                    return;
                }
                setState(edit, {
                    index: index,
                    editedTask: editedTask
                });
                break;
            case removeSpan:
                setState(remove, {
                    index: index
                });
                break;
            default:
                return;
        }
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(removeSpan);
    list.appendChild(li);
}

//DOM
const input = document.querySelector('#input');
const addBtn = document.querySelector('#addBtn');
const alertBox = document.querySelector('#customAlert');
const confirmBox = document.querySelector('#customConfirm');
const list = document.querySelector('#list');
const counterDisplay = document.querySelector('#counter');
const completedDisplay = document.querySelector('#completed');
const clearAllBtn = document.querySelector('#clearAll');
const checkAllBtn = document.querySelector('#checkAll');
const uncheckAllBtn = document.querySelector('#uncheckAll');
const undoBtn = document.querySelector('#undo');
const redoBtn = document.querySelector('#redo');

// SortableJS Lib. //
new Sortable(list, {
    animation: 150,
    ghostClass: 'blue-background-class'
});

addBtn.addEventListener('click', () => {
    if (!input.value) {
        notifyUser('Can\' t create empty task');
        resetUI();
        return;
    }

    setState(add, {
        todo: new Todo(input.value)
    });

    resetUI();
});

clearAllBtn.addEventListener('click', () => {
    batchEdit(clearAll);
});

checkAllBtn.addEventListener('click', () => {
    batchEdit(markAll, {
        option: true
    });
});

uncheckAllBtn.addEventListener('click', () => {
    batchEdit(markAll, {
        option: false
    });
});

undoBtn.addEventListener('click', () => {
    undo();
});

redoBtn.addEventListener('click', () => {
    redo();
});

//Helper
function log() {
    console.log('Todos: ', todos);
    console.log('Storage: ', JSON.parse(localStorage.getItem('todos')));
    console.log('History: ', records);
    console.log('Steps: ', steps);
}

function freeze(e) {
    e.stopPropagation();
}

function resetUI() {
    input.value = '';
    input.focus();
}

function notifyUser(message) {
    alertBox.textContent = message;

    window.addEventListener('click', freeze, true);

    alertBox.classList.remove('hidden');

    setTimeout(function () {

        alertBox.classList.add('hidden');

        window.removeEventListener('click', freeze, true);
    }, 2000);
}

function copyOf(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function updateHistory(obj) {
    records.push(copyOf(obj));
}

function save(obj) {
    localStorage.setItem('todos', JSON.stringify(obj));
}

//Run
window.onload = () => {
    render();
    resetUI();
}