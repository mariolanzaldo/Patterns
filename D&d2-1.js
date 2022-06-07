class Model {
    constructor() {
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

    addNote() {
        const noteObject = {
            id: Date.now(),
            content: "",
            create: `${new Date().toLocaleString()}`
        }
        this.notes.push(noteObject);
        localStorage.setItem("stickynotes-notes", JSON.stringify(this.notes));
    }

    deleteNote(id) {
        const newNotes = this.notes.filter(note => note.id != id);

        localStorage.setItem("stickynotes-notes", JSON.stringify(newNotes));
        return newNotes;
    }

    searchNote(noteToSearch) {
        let found = this.notes.map(element => {
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

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // this.model.bindNotesListChanged(this.onNotesListChanged);
        this.view.bindAddNote(this.handleAddNote);
        this.view.bindDeleteNote(this.handleDeleteNote);
        this.view.bindEditNote(this.handleEditNote);
        this.view.bindSearchNote(this.handleSearchNote);
        this.view.bindDragDrog(this.handleDragDrop);

        //Display initial notes
        this.onNotesListChanged(this.model.notes);
    }

    onNotesListChanged = notes => {
        this.view.displayNotes(notes);
    }

    handleAddNote = (note) => {
        this.model.addNote(note);
        this.onNotesListChanged(this.model.notes);
    }

    handleEditNote = (content, id) => {

        this.model.saveNote({
            id: id,
            content: content
        });
        this.onNotesListChanged(this.model.notes);
    }

    handleDeleteNote = (id) => {
        const newNotes = this.model.deleteNote(id);
        this.onNotesListChanged(newNotes);
    }

    handleSearchNote = (noteToSearch) => {
        return this.model.searchNote(noteToSearch);
    }

    handleDragDrop = (newOrder) => {
        this.model.dragDrogNote(newOrder);
        // this.onNotesListChanged(this.model.notes);

    }

}

class View {
    constructor() {

        this.root = document.querySelector('#app');
        this.notesList = document.querySelector('.note-list');
        this.btnAddNote = this.root.querySelector(".add-note");
        this.searchInput = document.querySelector("[data-search]");

        this.temporaryText = '';
    }

    get noteText() {
        const noteText = document.querySelector('.note');
        return noteText.value;
    }

    displayNotes(notes) {
        this.notesList.innerHTML = "";

        if (notes.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'There are any notes yet';
            this.notes.append(p);
        } else {
            notes.forEach(note => {
                const html = this.createListItemHTML(note.id, note.content, note.create, note.updated = new Date());
                this.notesList.appendChild(html);
            });
        }
    }

    createListItemHTML(id, content, created, updated) {
        const template2 = document.querySelector(".template2").content;
        const fragment = document.createDocumentFragment();

        const cont = template2.querySelector(".container");
        const note = template2.querySelector(".note");
        const noteCreate = template2.querySelector(".note-creation");
        const noteUpdate = template2.querySelector(".note-update");

        cont.setAttribute("data-note-id", id);
        cont.setAttribute("id", id);
        note.setAttribute("id", id);
        note.innerHTML = content;
        noteCreate.innerHTML = `Created: ${created.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;
        noteUpdate.setAttribute("id", id);
        noteUpdate.innerHTML = `Updated: ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;

        const clone = template2.cloneNode(true);
        fragment.appendChild(clone);
        return fragment;
    }

    bindAddNote(handler) {
        this.btnAddNote.addEventListener('click', event => {
            event.preventDefault();
            handler();
        });
    }

    bindDeleteNote(handler) {
        this.notesList.addEventListener('click', item => {
            item.preventDefault();
            if (item.target.className === 'note-remove') {
                let doDelete = confirm("Are you sure you want to delete this note?");
                if (doDelete) {
                    handler(item.target.parentElement.dataset.noteId);
                }
            }
        });
    }

    bindEditNote(handler) {
        this.notesList.addEventListener('click', item => {
            if (item.target.className === 'note-save') {
                this.temporaryText = item.target.previousElementSibling.value.trim();
                handler(this.temporaryText, item.target.parentElement.dataset.noteId);
                this.temporaryText = '';
            }
        });

        this.notesList.addEventListener('keydown', function (e) {
            if (e.key == 'Tab' && e.target.className === "note") {
                e.preventDefault();
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;

                e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);
                e.target.selectionEnd = start + 1;
            }
        });
    }

    bindSearchNote(handler) {
        const containers = document.getElementsByClassName("container");

        this.searchInput.addEventListener("input", event => {
            const value = event.target.value.toLowerCase();
            let found = handler(value);
            found = found.filter(el => el != undefined);
            found.forEach(element => {
                let container = document.getElementById(`${element.id}`);
                container.classList.toggle("hide", element.id);
            });
            if (value.length <= 0) {
                for (let i in containers) {
                    if (typeof containers[i] == 'object') {
                        containers[i].classList.toggle("hide", false);
                    }
                }
            }
        });
    }

    bindDragDrog(handler) {
        let dragElement;
        let newIdOrder = [];

        function addEvents(notesContainer) {

            notesContainer.addEventListener("dragstart", function (ev) {
                if (ev.target.className === 'container')
                    dragElement = ev.target
            });
            notesContainer.addEventListener("dragover", function (ev) {
                if (ev.target.parentElement.className === 'container' || ev.target.className === 'container')
                    ev.preventDefault()
            });
            notesContainer.addEventListener("drop", function (ev) {
                if (ev.target.parentElement.className === 'container') {
                    if (!dragElement) return;

                    ev.preventDefault();

                    const targetElement = ev.target.parentElement;
                    const targetClone = targetElement.cloneNode(true);
                    const dragClone = dragElement.cloneNode(true);

                    targetElement.replaceWith(dragClone);
                    dragElement.replaceWith(targetClone);

                    addEvents(targetClone);
                    addEvents(dragClone);
                    dragElement = undefined;

                    const newOrder = document.querySelectorAll('[data-note-id]');

                    newOrder.forEach(item => {
                        newIdOrder.push(item.dataset.noteId);
                    });
                    handler(newIdOrder);;
                }
            });
        }
        addEvents(this.notesList);
    }

}

const app = new Controller(new Model(), new View());