export default class Model {
    constructor() {
    }

    getAllNotes() {
        const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
        return notes;
    }

    saveNote(noteToSave) {
        const notes = this.getAllNotes();
        const existing = notes.find(note => note.id == noteToSave.id);
        if (existing) {
            if (existing.content !== noteToSave.content && noteToSave.undoUpdate === undefined) {
                existing.content = noteToSave.content;
                existing.updated = new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
            } else if (existing.content !== noteToSave.content && noteToSave.undoUpdate !== undefined) {
                existing.content = noteToSave.content;
                existing.updated = noteToSave.undoUpdate;
            }
            localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
        }
    }

    addNote(note) {
        let notes = this.getAllNotes();
        let noteObject = {};
        if (!note) {
            noteObject = {
                id: Date.now(),
                content: "",
                create: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`
            }
            notes.push(noteObject);
            localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
            return noteObject
        } else if (note) {
            notes.push(note);
            localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
        }
    }

    deleteNote(id) {
        const notes = this.getAllNotes();
        const newNotes = notes.filter(note => note.id != id);
        localStorage.setItem("stickynotes-notes", JSON.stringify(newNotes));
        return newNotes;
    }

    searchNote(noteToSearch) {
        const found = this.getAllNotes().map(element => {
            const content = element.content.toLowerCase().includes(noteToSearch);
            if (!content) {
                return element;
            }
        });
        return found;
    }

    dragDropNote(newOrder) {
        const oldOrder = [];
        let swappedElement = [];
        let newData = this.getAllNotes();
        this.getAllNotes().forEach(item => {
            oldOrder.push(item.id);
        });

        for (let i = 0; i < newOrder.length; i++) {
            if (newOrder[i] != oldOrder[i]) {
                swappedElement.push(i);
            }
        }

        let obj = { first: swappedElement[0], second: swappedElement[1] };
        let temp;
        temp = newData[obj.first];
        newData[obj.first] = newData[obj.second];
        newData[obj.second] = temp;
        localStorage.setItem("stickynotes-notes", JSON.stringify(newData));
    }
}
