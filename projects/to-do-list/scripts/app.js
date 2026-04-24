const localStorageTasks = localStorage.getItem('Tasks');
const tasks = JSON.parse(localStorageTasks) ?? [
  { id: crypto.randomUUID(), task: "To do homework", done: false },
  { id: crypto.randomUUID(), task: "Go to gym", done: false },
  { id: crypto.randomUUID(), task: "Go to work", done: true },
];

const tasksList = document.getElementById("tasksList");
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");

function saveTasks() {
  localStorage.setItem('Tasks', JSON.stringify(tasks));
}

function printTasks() {
  tasksList.innerHTML = "";

  if (!tasks.length) return;

  tasks.forEach((t) => {
    const li = document.createElement("li");
    
    li.innerHTML = `
      <div class="task-item">
        <span class="task-text ${t.done ? 'completed' : ''}" 
              onclick="toggleTask('${t.id}')">
          ${t.task}
        </span>
        <div class="actions">
          <button class="btn-action edit-btn" ${t.done ? 'hidden' : ''} onclick="editTask('${t.id}')">✏️</button>
          <button class="btn-action delete-btn" onclick="deleteTask('${t.id}')">🗑️</button>
        </div>
      </div>
    `;
    
    tasksList.appendChild(li);
  });
}

function addNewTask() {
  const taskName = taskInput.value.trim();
  if (taskName === "") return;

  tasks.push({
    id: crypto.randomUUID(),
    task: taskName,
    done: false
  });

  taskInput.value = "";
  addButton.disabled = true; 

  saveTasks();
  printTasks();
}

window.deleteTask = (id) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks.splice(index, 1);

    saveTasks();
    printTasks();
  }
};

window.editTask = (id) => {
  const newTaskName = prompt("Edit your task:");
  if (newTaskName !== null && newTaskName.trim() !== "") {
    const editedTask = tasks.find(t => t.id === id);
    if (editedTask) {
      editedTask.task = newTaskName;

      saveTasks();
      printTasks();
    }
  }
};

window.toggleTask = (id) => {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    
    saveTasks();
    printTasks();
  }
};

addButton.addEventListener('click', addNewTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !addButton.disabled) addNewTask();
});

taskInput.addEventListener('input', (e) => {
  addButton.disabled = e.target.value.trim().length === 0;
});

printTasks();
