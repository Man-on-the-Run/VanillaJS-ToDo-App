//Data//
class Todo {
  constructor(task) {
    this.task = task;
    this.completed = false;
  }
}

let todos;
let records = [];
let steps;
let undone;

//CRUD//
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

//localStorage//
function load() {
  todos = JSON.parse(localStorage.getItem("todos")) || [];
}

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

//feat.
function markAll({ option }) {
  todos.forEach(todo => {
    todo.completed = option;
  });
}

function undo() {
  const previousState = records.length - 2;
  if (previousState - steps < 0) {
    save();
    load();
    alert("Nothing to Undo");
    return;
  }
  undone = true;
  todos = copyOf(records[previousState - steps]);
  save();
  load();
  steps++;
  render();
  log();
}

function redo() {
  const latestState = records.length - 1;
  if (steps === 0) {
    save();
    load();
    alert("Nothing to Redo");
    return;
  }
  todos = copyOf(records[latestState - steps + 1]);
  save();
  load();
  steps--;
  render();
  log();
}

// Sync Data w/ UI //
function init() {
  load();
  render();

  records.push(copyOf(todos));

  undone = false;
  steps = 0;

  resetUI();
  log(); //
}

function sync() {
  save();
  init();
}

function setState(callback, params) {
  if (undone) {
    records.push(copyOf(todos));
  }
  callback(params);
  sync();
}

//Render//
function render() {
  list.innerHTML = "";
  todos.forEach(todo => {
    display(todo);
  });

  counterDisplay.textContent = todos.length;

  completedDisplay.textContent = todos.filter(todo => {
    return todo.completed === true;
  }).length;
}

function display(todo) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  const textSpan = document.createElement("span");
  const removeSpan = document.createElement("span");

  checkbox.checked = todo.completed;
  textSpan.textContent = todo.task;
  removeSpan.innerHTML = "&times";

  li.addEventListener("click", function(e) {
    const index = Array.from(this.parentElement.children).indexOf(this);

    switch (e.target) {
      case checkbox:
        setState(toggleCompleted, {
          index: index
        });
        break;
      case textSpan:
        const editedTask = prompt("Edit Task");
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

//Helper
function resetUI() {
  input.value = "";
  input.focus();
}

function copyOf(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function log() {
  console.log("Todos: ", todos);
  console.log("History: ", records);
  console.log("Undone: ", undone);
  console.log("Steps: ", steps);
}

//DOM
const input = document.querySelector("#input");
const addBtn = document.querySelector("#addBtn");
const list = document.querySelector("#list");
const counterDisplay = document.querySelector("#counter");
const completedDisplay = document.querySelector("#completed");
const clearBtn = document.querySelector("#clearAll");
const checkAllBtn = document.querySelector("#checkAll");
const uncheckAllBtn = document.querySelector("#uncheckAll");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");

addBtn.addEventListener("click", () => {
  if (!input.value) {
    alert("Can' t create empty task");
    return;
  }
  setState(add, {
    todo: new Todo(input.value)
  });
});

clearBtn.addEventListener("click", () => {
  if (!localStorage.getItem("todos") || !confirm("Are you sure?")) {
    return;
  }
  localStorage.clear();
  records = []; //
  init();
});

checkAllBtn.addEventListener("click", () => {
  if (todos.length === 0) {
    return;
  }
  setState(markAll, {
    option: true
  });
});

uncheckAllBtn.addEventListener("click", () => {
  if (todos.length === 0) {
    return;
  }
  setState(markAll, {
    option: false
  });
});

undoBtn.addEventListener("click", () => {
  undo();
});

redoBtn.addEventListener("click", () => {
  redo();
});

//Run
window.onload = () => {
  init();
};

// *********************************************** //

// function setState(callback, params) {
//   if (undone) {
//       records.push(copyOf(todos));
//       callback(params);
//   } else {
//       callback(params);
//   }
//   sync();
// }
