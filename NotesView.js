export default class NotesView {
    constructor(root, { onNoteAdd, onNoteEdit, onNoteDelete, onNoteSearch } = {}) {
        this.root = root;
        this.onNoteAdd = onNoteAdd;
        this.onNoteEdit = onNoteEdit;
        this.onNoteDelete = onNoteDelete;
        this.onNoteSearch = onNoteSearch;

        const template1 = document.querySelector(".template1").content;
        const fragment = document.createDocumentFragment();

        const clone = template1.cloneNode(true);
        fragment.appendChild(clone);
        this.root.appendChild(fragment);
        const btnAddNote = this.root.querySelector(".add-note");

        btnAddNote.addEventListener("click", () => {
            this.onNoteAdd(this.root);
        });
        const allNotes = document.querySelector(".note-list");
        allNotes.addEventListener("click", item => {
            item.preventDefault();
            if (item.target.className === 'note-remove') {
                let doDelete = confirm("Are you sure you want to delete this note?");
                if (doDelete) {
                    this.onNoteDelete(item.target.parentElement.dataset.noteId);
                }
            }
        });
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
        noteCreate.innerHTML = `Created: ${created}`;
        noteUpdate.setAttribute("id", id);
        noteUpdate.innerHTML = `Updated: ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;

        const clone = template2.cloneNode(true);
        fragment.appendChild(clone);
        return fragment;
    }

    updateNoteList(notes) {
        const notesListContainer = this.root.querySelector(".note-list");
        notesListContainer.innerHTML = "";
        for (const note of notes) {
            const html = this.createListItemHTML(note.id, note.content, note.create, new Date(note.updated));
            notesListContainer.appendChild(html);
        }

        this.addSaveEvent(notesListContainer);
        this.addTabEvent(notesListContainer);
        this.addSearchEvents();
        this.addDragDropEvents(notesListContainer);

    }

    addSaveEvent(notesContainer){
        notesContainer.addEventListener("click", item => {
            if (item.target.className === 'note-save') {
                const updatedBody = item.target.previousElementSibling.value.trim();
                this.onNoteEdit(updatedBody, item.target.parentElement.dataset.noteId);
            }
        });
    }

    addTabEvent(notesContainer){
        notesContainer.addEventListener('keydown', function (e) {
            if (e.key == 'Tab' && e.target.className === "note") {
                e.preventDefault();
                let start = e.target.selectionStart;
                let end = e.target.selectionEnd;

                e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);
                e.target.selectionEnd = start + 1;
            }
        });
    }

    addDragDropEvents (notesContainer){
        
        let dragElement;
        let swappedElement = [];

        function addEvents(notesContainer) {
            notesContainer.addEventListener("dragstart", function (ev) { 
                if (ev.target.className === 'container')
                    dragElement = ev.target
                });
            notesContainer.addEventListener("dragover", function (ev) { 
                if (ev.target.parentElement.className === 'container' || ev.target.className === 'container')
                ev.preventDefault() });
                notesContainer.addEventListener("drop", function (ev) {
                if (ev.target.parentElement.className === 'container'){
                if (!dragElement) return;
    
                ev.preventDefault();
    
                const targetElement = ev.target.parentElement;
                const targetClone = targetElement.cloneNode(true);
                const dragClone = dragElement.cloneNode(true);
    
                targetElement.replaceWith(dragClone);
                dragElement.replaceWith(targetClone);
    
                addEvents(targetClone );
                addEvents(dragClone);
                dragElement = undefined;

                //Persistance.... relocate these in the pertinent modules IMPORTANT! The DOM can't be touched either by notesAPI nor APP
                const newOrder = document.querySelectorAll('[data-note-id]');
                
                //This part goes at notes API and app
                let oldId = [];
                let oldData = JSON.parse(localStorage.getItem("stickynotes-notes"))
                oldData.forEach(item => {
                    oldId.push(item.id);
                });

                //Send this to app. App will send this to NOTESAPI
                let newId = [];
                newOrder.forEach(item => {
                    newId.push(item.dataset.noteId);
                });

                console.log(`Old order: ${oldId}`);
                console.log(`New order: ${newId}`);

               for (let i = 0; i < newId.length; i++){
                //    let temp;
                if(newId[i] != oldId[i]) {
                   swappedElement.push(i);
                }
               }
               let obj = { first: swappedElement[0], second: swappedElement[1] };
               let temp;
                temp = oldData[obj.first];
                oldData[obj.first] = oldData[obj.second];
                oldData[obj.second] = temp;
            
                localStorage.setItem("stickynotes-notes", JSON.stringify(oldData));
                
                }
            });
        };
        addEvents(notesContainer);
    }

    addSearchEvents(){
        const searchInput = document.querySelector("[data-search]");
        let containers = document.querySelectorAll(".container");

        searchInput.addEventListener("input", event => {
            const value = event.target.value.toLowerCase();
            let found = this.onNoteSearch(value);
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
}