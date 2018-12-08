let selectFileButton = document.getElementById("selectFileButton");
let updateButton = document.getElementById("readFileButton");
let taskContainer = document.getElementById("task_container");
let addInput = document.getElementById("addInput");
let addButton = document.getElementById("addButton");

addButton.addEventListener('click', addTask);

let parser = new DOMParser();
let storage = window.localStorage;
let taskManager = new TaskManager(storage);
var tasks = [];
// tasks = JSON.parse(`[{"text":"Three","timestamp":1544187258016},{"text":"Two","timestamp":1544186876526}]`)
// displayTasks(tasks);

function gapi_loaded() {
    taskManager.loadLibrary().then((tasks) => {
        displayTasks(tasks);
    }).catch((reason) => {
        // Show error
        console.error(reason);
    });
}

function addTask() {
    let text = addInput.value;
    taskManager.addTask(text).then((tasks) => {
        displayTasks(tasks);
    }).catch((reason) => {
        // Show error
        console.error(reason);
    });
}

selectFileButton.addEventListener("click", () => {
    taskManager.setFile().then((fileName) => {
        console.log(fileName);
    }).catch((reason) => {
        // Show error
        console.error(reason);
    });
});

updateButton.addEventListener("click", () => {
    taskManager.updateTasks().then((tasks) => {
        displayTasks(tasks);
    }).catch((reason) => {
        // Show error
        console.error(reason);
    });
});


function formatDate(d) {
    let month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes();
    return `${[year, month, day].join("-")} ${hour}:${minute}`;
}

function taskToHtml(text, timestamp) {
    let res =
        `<div>
            <div class="taskContainer">
                <div class="taskProperties">
                    <h2>${text}</h2>
                    <p>${timestamp}</p>
                </div>
                <div class="tools">
                    <button class='button removeButton'>×</button>
                </div>
            </div>
            <div class="divider"></div>
        </div>`;
    return res;
}


function displayTasks(tasks) {
    if (!tasks) {
        return;
    }
    taskContainer.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        console.log(task);
        let taskDate = new Date(task.timestamp);
        let timeStr = formatDate(taskDate);
        let childTask = parser.parseFromString(taskToHtml(task.text, timeStr), "text/html").body.childNodes[0];
        let removeButton = childTask.querySelector('.removeButton');
        removeButton.addEventListener('click', () => {
            console.log('remove', task);
            // Remove the task from the list
            taskManager.removeTask(task).then((tasks) => {
                displayTasks(tasks);
            }).catch((reason) => {
                console.error(reason);
            });
        })
        taskContainer.appendChild(childTask);
    }
}
