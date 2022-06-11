import {pubsub} from './pubsub.js'

export default class View {
    constructor() {
        console.log('view')
        this.root = document.querySelector('#app');
        this.notesList = document.querySelector('.note-list');
        this.btnAddNote = this.root.querySelector(".add-note");
        this.searchInput = document.querySelector("[data-search]");
        this.btnUndo = document.querySelector('.undo');

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

    bindAddNote() {
        this.btnAddNote.addEventListener('click', event => {
            event.preventDefault();
            pubsub.publish(`addNote`);
        });
    }

    bindDeleteNote() {
        this.notesList.addEventListener('click', item => {
            item.preventDefault();
            pubsub.publish('deleteNote',{ 
                class: item.target.className,
                 id:item.target.parentElement.dataset.noteId
                 });
        });
    }

    bindEditNote() {
        this.notesList.addEventListener('click', item => {
            item.preventDefault();
            if(item.target.className === 'note-save'){
                pubsub.publish(`editNote`, { content: item.target.previousElementSibling.value.trim(), id: item.target.parentElement.dataset.noteId});
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

    filterNotes(found, value){
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

    }

    bindUndo(){
        this.btnUndo.addEventListener('click', event => {
            pubsub.publish('undoAction');
        });
    }

    bindSearchNote() {
        const containers = document.getElementsByClassName("container");

        this.searchInput.addEventListener("input", event => {
            const value = event.target.value.toLowerCase();
            pubsub.publish(`searchNote`, value);
        });
    }

    bindDragDrog() {
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

                    pubsub.publish(`dragDrop`, newIdOrder);
                }
            });
        }
        addEvents(this.notesList);
    }

}
