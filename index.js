let selectFileButton = document.getElementById("selectFileButton");
let updateButton = document.getElementById("readFileButton");
let taskContainer = document.getElementById("task_container");
let addInput = document.getElementById("addInput");
let addButton = document.getElementById("addButton");

addButton.addEventListener('click', addTask);

let fileHandler = new FileHandler();
let storage = window.localStorage;
var tasks = [];

function gapi_loaded() {
    fileHandler.loadLibrary(() => {
        console.log("Loaded!");
        updateTasks();
    });
}

function updateTasks() {
    let fileId = storage.getItem("file_id");
    fileHandler.downloadFile(fileId, (all_tasks) => {
        // tasks = JSON.parse(data);
        // Sort tasks in descending order
        tasks = all_tasks;
        tasks = tasks.sort((a, b) => { return (b.timestamp - a.timestamp) });
        displayTasks(tasks);
    });
}

function addTask() {
    let text = addInput.value;
    let timestamp = Date.now();
    let task = { text, timestamp }
    tasks.splice(0, 0, task);
    console.log(tasks);
    displayTasks(tasks);
    storeTasks();
}

function storeTasks() {
    let fileId = storage.getItem("file_id");
    fileHandler.updateFile(fileId, JSON.stringify(tasks), () => {
        // displayTasks(tasks);
    });
}


selectFileButton.addEventListener("click", () => {
    fileHandler.openFile((fileId) => {
        storage.setItem("file_id", fileId);
        console.log("File opened");
    });

});
updateButton.addEventListener("click", () => {
    updateTasks();
});



let parser = new DOMParser();

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
            tasks.splice(tasks.indexOf(task), 1);
            console.log(tasks);
            storeTasks();
            displayTasks(tasks);
        })
        taskContainer.appendChild(childTask);
    }
}
