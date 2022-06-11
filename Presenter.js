import View from './View.js'
import Model from './Model.js'
import {pubsub} from './pubsub.js'
import CommandManager from './command.js';

class Presenter {
    constructor(model, view) {
        console.log('controller');
        this.model = model;
        this.view = view;
        this.manager = new CommandManager();

        // this.model.bindNotesListChanged(this.onNotesListChanged);
        this.view.bindAddNote(this.handleAddNote);
        this.view.bindDeleteNote(this.handleDeleteNote);
        this.view.bindEditNote(this.handleEditNote);
        this.view.bindSearchNote(this.handleSearchNote);
        this.view.bindDragDrog(this.handleDragDrop);
        this.view.bindUndo(this.handleUndo);

        //Display initial notes
        this.onNotesListChanged(this.model.notes);


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
        this.model.dragDrogNote(newOrder);

    }

    handleUndo = () => {
        this.manager.undo();
    }

    //Control z event ?

}

//Commands
class DeleteCommand{
    constructor(id, model, view){
        this.deletedNoteId = id;
        this.model = model;
        this.view = view;
        this.noteDeleted = [];
    }

    execute(){
        const noteToSave = this.model.notes.filter(element => element.id == this.deletedNoteId);
        this.noteDeleted.push(noteToSave);
        const newNotes = this.model.deleteNote(this.deletedNoteId); 
        this.view.displayNotes(newNotes);
        
    }

    undo(){
        this.model.addNote(this.noteDeleted[ this.noteDeleted.length - 1]);
        this.noteDeleted.pop();
        this.view.displayNotes(this.model.notes);
    }
}

class AddCommand{
    constructor(model, view){
        this.model = model;
        this.view = view;
        this.newNote;
    }

    execute(){
        this.newNote = this.model.addNote();
        this.view.displayNotes(this.model.notes);
    }

    undo (){
        const newNotes = this.model.deleteNote(this.newNote.id);
        this.view.displayNotes(newNotes);
    }
}

//This is not working.....
class EditCommand{
    constructor(model, view){
        this.model = model;
        this.view = view;
        this.notes = Object.assign({}, model.notes);
        this.previousNote = [];
    }

    execute(args){
        const id = args.id;
        console.log(this.notes);
       
        // this.previousNote.push(noteToSave);
        // console.log(this.previousNote);
        // this.model.saveNote({ id: args.id, content: args.content});
        // this.view.displayNotes(this.model.notes);
    }

    undo(){
        console.log(this.previousNote)
        this.model.saveNote({ id: this.previousNote.id, content: this.previousNote.content });
        this.view.displayNotes(this.model.notes);
    }
}

const app = new Presenter(new Model(), new View());