export default class Model {
    constructor() {
        console.log('model')

        this.notes = JSON.parse(localStorage.getItem('stickynotes-notes') || []);
    }
    

    // bindNotesListChanged(callback){
    //     this.onNotesListChanged = callback;
    // }

    // _commit (notes){
    //     this.bindNotesListChanged(notes);
    //     localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    // }

    saveNote(noteToSave) {
        const existing = this.notes.find(note => note.id == noteToSave.id);
        if (existing && existing.content !== noteToSave.content) {
            existing.content = noteToSave.content;
            existing.updated = new Date().toISOString();
            localStorage.setItem("stickynotes-notes", JSON.stringify(this.notes));
        }
    }

    addNote(note) {
        let noteObject = {};
        if(!note){
            noteObject = {
                id: Date.now(),
                content: "",
                create: `${new Date().toLocaleString()}`
            }
            this.notes.push(noteObject);
        } 
        localStorage.setItem("stickynotes-notes", JSON.stringify(this.notes));
        return noteObject;
    }

    deleteNote(id) {
        const newNotes = this.notes.filter(note => note.id != id);

        localStorage.setItem("stickynotes-notes", JSON.stringify(newNotes));
        return newNotes;
    }

    searchNote(noteToSearch) {
        const found = this.notes.map(element => {
            const content = element.content.toLowerCase().includes(noteToSearch);
            if (!content) {
                return element;
            }
        });
        return found;
    }

    dragDrogNote(newOrder) {
        const oldOrder = [];
        let swappedElement = [];
        let newData = this.notes;
        this.notes.forEach(item => {
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