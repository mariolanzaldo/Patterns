const notesAPI = {
    getAllNotes: function () {
        const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
        return notes;
    },
    saveNote: function (noteToSave) {
        const notes = this.getAllNotes();
        const existing = notes.find(note => note.id == noteToSave.id);

        if (existing) {
            if (existing.content !== noteToSave.content) {
                existing.content = noteToSave.content;
                existing.updated = new Date().toISOString();
            }
        } else {
            noteToSave.id = Date.now();
            noteToSave.updated = new Date().toISOString();
            notes.push(noteToSave);
        }

        localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    },
    deleteNote: function (id) {
        const notes = this.getAllNotes();
        const newNotes = notes.filter(note => note.id != id);
        localStorage.setItem("stickynotes-notes", JSON.stringify(newNotes));
    },
    searchNote: function (noteToSearch) {
        const notes = this.getAllNotes();
        console.log(notes);
        let found = notes.map(element => {
            const content = element.content.toLowerCase().includes(noteToSearch);
            if (!content) {
                return element;
            }
        });
        return found;
    }
}

export default notesAPI;