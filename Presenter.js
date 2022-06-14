import View from './View.js'
import Model from './Model.js'
import { pubsub } from './pubsub.js'
import CommandManager from './command.js';

class Presenter {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.manager = new CommandManager();

        this.view.bindAddNote(this.handleAddNote);
        this.view.bindDeleteNote(this.handleDeleteNote);
        this.view.bindEditNote(this.handleEditNote);
        this.view.bindSearchNote(this.handleSearchNote);
        this.view.bindDragDrog(this.handleDragDrop);
        this.view.bindUndo(this.handleUndo);

        //Display initial notes
        this.onNotesListChanged(this.model.getAllNotes());

        //Subscribers
        pubsub.subscribe(`deleteNote`, this.handleDeleteNote);
        pubsub.subscribe(`addNote`, this.handleAddNote);
        pubsub.subscribe(`editNote`, this.handleEditNote);
        pubsub.subscribe(`searchNote`, this.handleSearchNote);
        pubsub.subscribe(`dragDrop`, this.handleDragDrop);
        pubsub.subscribe(`undoAction`, this.handleUndo);
    }

    onNotesListChanged = notes => {

        this.view.displayNotes(notes);
    }

    handleAddNote = () => {
        const addNoteCommand = new AddCommand(this.model, this.view);
        this.manager.executeCommand(addNoteCommand);
    }

    handleEditNote = (args) => {
        const editNoteCommand = new EditCommand(this.model, this.view);
        this.manager.executeCommand(editNoteCommand, args);
    }

    handleDeleteNote = (args) => {
        if (args.class === 'note-remove') {
            let doDelete = confirm("Are you sure you want to delete this note?");
            if (doDelete) {
                const deleteNoteCommand = new DeleteCommand(args.id, this.model, this.view);
                this.manager.executeCommand(deleteNoteCommand);
            }
        }
    }

    handleSearchNote = (noteToSearch) => {
        let list = this.model.searchNote(noteToSearch);
        const found = list.filter(el => el != undefined);
        this.view.filterNotes(found, noteToSearch);
    }

    handleDragDrop = (newOrder) => {
        const dragNoteCommand = new DragCommand(this.model, this.view);
        this.manager.executeCommand(dragNoteCommand, newOrder);
    }

    handleUndo = () => {
        let value;
        if (this.manager.history.length > 0) {
            value = false;
            this.manager.undo();
        } else if (this.manager.history.length <= 0) {
            value = true;
        }
        this.view.disableUndo(value);
    }
}

//Commands
class DeleteCommand {
    constructor(id, model, view) {
        this.deletedNoteId = id;
        this.model = model;
        this.view = view;
        this.noteDeleted = [];
        this.notes = JSON.parse(JSON.stringify(this.model.getAllNotes()));
    }

    execute() {
        const noteToSave = this.notes.filter(element => element.id == this.deletedNoteId);
        this.noteDeleted.push(noteToSave[0]);
        const newNotes = this.model.deleteNote(this.deletedNoteId);
        this.view.displayNotes(newNotes);

    }

    undo() {
        const lastNote = this.noteDeleted.pop();
        this.model.addNote(lastNote);
        this.view.displayNotes(this.model.getAllNotes());
    }
}

class AddCommand {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.newNote;
    }

    execute() {
        this.newNote = this.model.addNote();
        this.view.displayNotes(this.model.getAllNotes());
    }

    undo() {
        const newNotes = this.model.deleteNote(this.newNote.id);
        this.view.displayNotes(newNotes);
    }
}

class EditCommand {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.previousNote = [];
    }

    execute(args) {
        const id = args.id;
        let noteToSave = this.model.getAllNotes().filter(element => element.id == args.id);
        const copy = JSON.parse(JSON.stringify(noteToSave));
        this.previousNote.push(copy);
        this.model.saveNote({ id: args.id, content: args.content });
        this.view.displayNotes(this.model.getAllNotes());
    }

    undo() {
        const lastNote = this.previousNote.pop();
        lastNote[0].undoUpdate = lastNote[0].updated;
        this.model.saveNote(lastNote[0]);
        this.view.displayNotes(this.model.getAllNotes());
    }
}


class DragCommand {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.oldOrder = JSON.parse(JSON.stringify(this.model.getAllNotes()));
    }

    execute(newOrder) {
        this.model.dragDropNote(newOrder);
    }

    undo() {
        let oldIdOrder = [];
        this.oldOrder.forEach(element => oldIdOrder.push(element.id));
        this.model.dragDropNote(oldIdOrder);
        oldIdOrder = [];
        this.view.displayNotes(this.oldOrder);
    }
}
const app = new Presenter(new Model(), new View());
