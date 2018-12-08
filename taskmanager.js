class TaskManager {
    constructor(storage) {
        this.storage = storage;
        this.fileId = storage.getItem("file_id");
        this.fileName = storage.getItem("file_name");
        this.tasks = [];
        this.fileHandler = new FileHandler();
    }


    loadLibrary() {
        return new Promise((resolve, reject) => {
            this.fileHandler.loadLibrary(() => {
                this.updateTasks().then((tasks) => {
                    resolve(tasks);
                }).catch(reject);
            });
        });
    }

    getTasks() {
        return this.tasks;
    }

    addTask(text) {
        return new Promise((resolve, reject) => {
            let timestamp = Date.now();
            let task = { text, timestamp }
            this.tasks.splice(0, 0, task);
            this.storeTasks().then(() => {
                resolve(this.tasks);
            }).catch(reject);
        });
    }

    removeTask(task) {
        return new Promise((resolve, reject) => {
            this.tasks.splice(this.tasks.indexOf(task), 1);
            this.storeTasks().then(resolve).catch(reject);
        });
    }

    setFile() {
        return new Promise((resolve, reject) => {
            this.fileHandler.openFile((fileId, fileName) => {
                this.fileId = fileId;
                this.fileName = fileName;
                storage.setItem("file_id", fileId);
                storage.setItem("file_name", fileName);
                resolve(fileName);
            });
        });
    }

    storeTasks() {
        return new Promise((resolve, reject) => {
            if (this.fileId) {
                this.fileHandler.updateFile(this.fileId, JSON.stringify(this.tasks), () => {
                    resolve(this.tasks);
                });
            } else {
                reject("No file selected");
            }
        });
    }

    updateTasks() {
        return new Promise((resolve, reject) => {
            if (this.fileId) {
                this.fileHandler.downloadFile(this.fileId, (all_tasks) => {
                    if (!all_tasks) {
                        reject("No data found");
                    } else {
                        // Sort tasks in descending order
                        this.tasks = all_tasks;
                        this.tasks = this.tasks.sort((a, b) => { return (b.timestamp - a.timestamp) });
                        resolve(this.tasks);
                    }
                });
            } else {
                reject("No file selected");
            }
        });
    }
}