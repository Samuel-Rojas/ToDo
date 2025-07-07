const userTask = document.getElementById("task-input");
const taskDiv = document.getElementById("task-container");
const addBtn = document.getElementById("add-task");
const themeToggle = document.getElementById("theme-toggle");
const bodyEl = document.body;

async function fetchTasks() {
    const res = await fetch("http://localhost:3000/tasks");

    if(!res.ok) {
        throw new Error("Failed to fetch tasks: " + res.statusText);
    }

    const data = await res.json();

    tasks = data;
    renderTasks();
}

async function addTask(text) {
    const res = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
           'Content-Type': "application/json" 
        },
        body: JSON.stringify({text })
    });

    if(!res.ok) {
        throw new Error("Failed to add task: " + res.statusText);
    }

    const newTask = await res.json();

    tasks.push({
        id: newTask.id,
        text: newTask.text,
        done: newTask.done,
        isEditing: false
    });
    renderTasks();
}


async function editTask(id, { text, done }){
    const res = await fetch("http://localhost:3000/tasks/${id}", {
        method: "PUT",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({text, done})
    });

    if(!res.ok){
        throw new Error("Failed to edit task: " + res.statusText);
    }

    const updated = await res.json();

    const taskIndex = tasks.findIndex(t => t.id === id);

    if(taskIndex > -1) {
        tasks[taskIndex].text = updated.text;
        tasks[taskIndex].done = updated.done;

        tasks[taskIndex].isEditing = false;
    }

    renderTasks();
}

async function deleteTask(id){
    // TODO:
  //   • const res = await fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE' })
  //   • if (!res.ok) throw
  //   • remove the task from tasks[] (e.g. tasks = tasks.filter(t=>t.id!==id))
  //   • renderTasks()

  const res = await fetch(`http://localhost:3000/tasks/${id}`,{
    method: "DELETE",
    "headers": {
        "Content-Type": "application/json",
    },
  });

  if(!res.ok){
    throw new Error("Failed to delete task" + res.statusText);
  }

  tasks = tasks.filter(t => t.id !== id);

  renderTasks();

}


fetchTasks().catch(console.error);

addBtn.addEventListener("click", async () => {
    const text = userTask.value.trim();
    if(!text) { 
        return;
    }
    userTask.value = '';
    try {
        await addTask(text);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});



const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark"){
    bodyEl.classList.add('dark-mode');
    themeToggle.textContent = "☀️Light Mode";
}

let tasks = [];

function loadFromStorage() {
    const saved = localStorage.getItem("myTodoList");
    if(saved) tasks = JSON.parse(saved);
}

function saveToStorage() {
    localStorage.setItem("myTodoList", JSON.stringify(tasks))
}

themeToggle.addEventListener("click", () => {
    const isDark = bodyEl.classList.toggle("dark-mode");
    themeToggle.textContent = isDark ? "☀️Light Mode" : "🌙Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
})

function renderTasks () {
    taskDiv.innerHTML = "";

    tasks.forEach((task) => {
        const li = document.createElement("li");
        const buttonDiv = document.createElement("button");
        buttonDiv.classList.add("button-div");
        li.dataset.id = task.id;
        let textEl;

        if(task.isEditing) {
            textEl = document.createElement('input');
            textEl.value = task.text;
            textEl.classList.add("edit-input");
        } else {
            textEl = document.createElement("span");
            textEl.textContent = task.text;
        }

        const editBtn = document.createElement("button");
        editBtn.textContent = task.isEditing ? "Save" : "Edit";
        editBtn.classList.add("edit-button");
        editBtn.addEventListener("click", async () => {
            if(task.isEditing) {
                const newText = textEl.value.trim();
                if(newText) task.text = newText;
                task.isEditing = false;
                try {
                    await editTask()
                } catch (err) {
                    console.error(err);
                    alert(err.message);
                } 
            } else {
                task.isEditing = true;
            }
            saveToStorage();
            renderTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-button");
        deleteBtn.addEventListener("click", async () => {
            try {
                await deleteTask(id);
            } catch (err){
                console.error(err);
                alert(err.message);
            }
            saveToStorage();
            renderTasks();
        })
        buttonDiv.append(editBtn, deleteBtn);
        li.append(textEl, buttonDiv);
        taskDiv.appendChild(li);
    });
    
}

loadFromStorage();
renderTasks();


