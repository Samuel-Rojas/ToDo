const userTask = document.getElementById("task-input");
const taskDiv = document.getElementById("task-container");
const addBtn = document.getElementById("add-task");
const themeToggle = document.getElementById("theme-toggle");
const bodyEl = document.body;

userTask.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addBtn.click();
    }
})

let tasks = [];

async function fetchTasks() {
    const res = await fetch("http://localhost:3000/tasks");

    if (!res.ok) {
        throw new Error("Failed to fetch tasks: " + res.statusText);
    } else {
        console.log("Success at fetching tasks");
    }

    const data = await res.json();

    tasks = data;
    tasks = tasks.map(t => ({ ...t, isEditing: false }));

    taskDiv.innerHTML = "";

    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskDiv.appendChild(li);
    })

    
}

async function addTask(text) {
    const res = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ text })
    });




    return await res.json();
}


async function editTask(id, { text, done }) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "PUT",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ text, done })
    });

    if (!res.ok) {
        throw new Error("Failed to edit task: " + res.statusText);
    }

    const updated = await res.json();

    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex > -1) {
        tasks[taskIndex].text = updated.text;
        tasks[taskIndex].done = updated.done;
        tasks[taskIndex].isEditing = false;
    
    }

}

async function deleteTask(id) {
    // TODO:
    //   • const res = await fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE' })
    //   • if (!res.ok) throw
    //   • remove the task from tasks[] (e.g. tasks = tasks.filter(t=>t.id!==id))
    //   • renderTasks()

    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE",
        "headers": {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Failed to delete task" + res.statusText);
    }

    tasks = tasks.filter(t => t.id !== id);


}

addBtn.addEventListener("click", async () => {
    const text = userTask.value.trim();
    if (!text) {
        return;
    }
    userTask.value = '';
    try {
        const newTask = await addTask(text);
        newTask.isEditing = false;
        tasks.push(newTask);

        const li = createTaskElement(newTask);
        taskDiv.appendChild(li);
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});



const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    bodyEl.classList.add('dark-mode');
    themeToggle.textContent = "☀️Light Mode";
}

themeToggle.addEventListener("click", () => {
    const isDark = bodyEl.classList.toggle("dark-mode");
    themeToggle.textContent = isDark ? "☀️Light Mode" : "🌙Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
})

function createTaskElement(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id
    li.classList.add("task-item", "fade-in");

    let textEl;
    if (task.isEditing) {
        textEl = document.createElement("input");
        textEl.value = task.text;
        textEl.classList.add("edit-input");
    } else {
        textEl = document.createElement("span");
        textEl.textContent = task.text;
    }

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-button");
    editBtn.textContent = task.isEditing ? "Save" : "Edit";
    editBtn.addEventListener("click", async () => {
        if (task.isEditing) {
            const newText = textEl.value.trim();
            if (!newText) return;
            try {
                const updated = await editTask(task.id, { text: newText, done: task.done });
                task.text = updated.text;
                task.isEditing = false;

                const span = document.createElement("span");
                span.textContent = updated.text;
                li.replaceChild(span, textEl);
                textEl = span;
                editBtn.textContent = "Edit";
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        } else {
            task.isEditing = true;
            const input = document.createElement("input");
            input.value = task.text;
            input.classList.add("edit-input");
            li.replaceChild(input, textEl);
            textEl = input;
            editBtn.textContent = "Save";
            input.focus();
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
        if (!confirm("Delete this task?")) return;
        try {
            await deleteTask(task.id);
            li.remove();                        // remove this <li> only
        } catch (err) {
            console.error(err);
            alert(err.message);

        }
    });

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-div");
    buttonDiv.append(editBtn, deleteBtn);

    li.append(textEl, buttonDiv);

    // REMOVE the animation class after it finishes
    li.addEventListener("animationend", () => {
        li.classList.remove("fade-in");
    });

    return li;
}




fetchTasks().catch(err => {
        console.error(err);
        alert("could not fetch tasks from the backend.");
    })