import { pubsub } from './pubsub.js'

export default class View {
    constructor() {
        this.root = document.querySelector('#app');
        this.notesList = document.querySelector('.note-list');
        this.btnAddNote = this.root.querySelector(".add-note");
        this.searchInput = document.querySelector("[data-search]");
        this.btnUndo = document.querySelector('.undo');
    }

    displayNotes(notes) {
        this.notesList.innerHTML = "";

        notes.forEach(note => {
            const html = this.createListItemHTML(note.id, note.content, note.create, note.updated);
            this.notesList.appendChild(html);
        });
    }

    createListItemHTML(id, content, created, updated = new Date()) {
        const fragment = document.createDocumentFragment();
        const template = document.querySelector(".template").content;
        const cont = template.querySelector(".container");
        const note = template.querySelector(".note");
        const noteCreate = template.querySelector(".note-creation");
        const noteUpdate = template.querySelector(".note-update");

        cont.setAttribute("data-note-id", id);
        cont.setAttribute("id", id);
        note.setAttribute("id", id);
        note.innerHTML = content;
        noteCreate.innerHTML = `Created: ${created.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;
        noteUpdate.setAttribute("id", id);
        noteUpdate.innerHTML = `Updated: ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`;

        const clone = template.cloneNode(true);
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
            pubsub.publish('deleteNote', {
                class: item.target.className,
                id: item.target.parentElement.dataset.noteId
            });
        });
    }

    bindEditNote() {
        const fragment = document.createDocumentFragment();
        const template = document.querySelector('.template2').content;

        this.notesList.addEventListener('dblclick', event => {
            if (event.target.className === 'note') {
                const note = event.target;
                const noteContainer = event.target.parentElement;
                const date = event.target.parentElement.querySelector('.note-update').textContent;
                note.style.backgroundColor = 'rgb(176, 172, 172)';

                note.readOnly = false;

                note.addEventListener('input', item => {
                    if (!noteContainer.querySelector('.not-saved')) {
                        const clone = template.cloneNode(true);
                        fragment.appendChild(clone);
                        noteContainer.appendChild(fragment);

                    }
                    item.stopPropagation();
                });
                note.addEventListener('focusout', item => {
                    const chart = event.target.parentElement.querySelector(`.not-saved`);
                    chart ? chart.remove() : chart;
                    item.stopPropagation();
                    pubsub.publish(`editNote`, { content: event.target.value.trim(), id: noteContainer.dataset.noteId, updatedUndo: date });
                });
            }
        });

        this.notesList.addEventListener('keydown', function (e) {

            if (e.key == 'Tab' && e.target.className === "note") {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;

                e.target.value = e.target.value.substring(0, start) + "\t" + e.target.value.substring(end);
                e.target.selectionEnd = start + 1;
            }
        });
    }

    filterNotes(found, value) {
        const containers = document.getElementsByClassName("container");
        found.forEach(element => {
            const container = document.getElementById(`${element.id}`);
            container.classList.toggle("hide", element.id);
        });
        if (value.length <= 0) {
            for (const i in containers) {
                if (typeof containers[i] == 'object') {
                    containers[i].classList.toggle("hide", false);
                }
            }
        }

    }

    bindUndo() {
        this.btnUndo.addEventListener('click', () => {
            pubsub.publish('undoAction');
        });

        window.addEventListener('keydown', event => {
            if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
                pubsub.publish('undoAction');
            }
        });
    }

    bindSearchNote() {
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
                    newIdOrder = [];
                }
            });
        }
        addEvents(this.notesList);
    }
}
