class TaskManager {
    constructor(storage) {
        this.storage = storage;
        this.fileId = storage.getItem("file_id");
        this.fileName = storage.getItem("file_name");
        this.tasks = [];
        this.fileHandler = new FileHandler();
    }


    loadLibrary(onComplete) {
        this.fileHandler.loadLibrary(() => {
            this.updateTasks((tasks) => {
                onComplete(tasks);
            });
        });
    }

    getTasks() {
        return this.tasks;
    }

    addTask(text, onComplete) {
        let timestamp = Date.now();
        let task = { text, timestamp }
        this.tasks.splice(0, 0, task);
        this.storeTasks(() => {
            onComplete(this.tasks);
        });
    }

    removeTask(task, onComplete) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
        this.storeTasks(() => {
            onComplete(this.tasks);
        });
    }

    setFile(onComplete) {
        this.fileHandler.openFile((fileId, fileName) => {
            this.fileId = fileId;
            this.fileName = fileName;
            storage.setItem("file_id", fileId);
            storage.setItem("file_name", fileName);
            // console.log("File opened");
            onComplete(fileName);
        });
    }

    storeTasks(onComplete) {
        if (this.fileId) {
            this.fileHandler.updateFile(this.fileId, JSON.stringify(this.tasks), () => {
                onComplete();
            });
        }
    }

    updateTasks(onComplete) {
        if (this.fileId) {
            this.fileHandler.downloadFile(this.fileId, (all_tasks) => {
                if (!all_tasks) {
                    onComplete(null);
                } else {
                    // tasks = JSON.parse(data);
                    // Sort tasks in descending order
                    this.tasks = all_tasks;
                    this.tasks = this.tasks.sort((a, b) => { return (b.timestamp - a.timestamp) });
                    onComplete(this.tasks);
                }
            });
        } else {
            onComplete(null);
        }
    }
}