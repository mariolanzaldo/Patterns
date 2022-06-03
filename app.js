import NotesView from "./notesView.js";

export default class App {
    constructor(root, notesAPI) {
        this.notes = [];
        this.notesAPI = notesAPI;
        this.activeNote = null;
        this.view = new NotesView(root, this.handlers());
        this.refreshNotes();

    }

    refreshNotes() {
        const notes = this.notesAPI.getAllNotes();
        this.setNotes(notes);
    }

    setNotes(notes) {
        this.notes = notes;
        this.view.updateNoteList(notes);
    }

    handlers() {
        return {
            onNoteEdit: (content, id) => {

                this.notesAPI.saveNote({
                    id: id,
                    content: content,
                });

                this.refreshNotes();
            },
            onNoteAdd: () => {
                const notes = this.notesAPI.getAllNotes();

                const noteObject = {
                    id: Date.now(),
                    content: "",
                    create: `${new Date().toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}`
                }
                notes.push(noteObject);
                this.notesAPI.saveNote(noteObject);
                this.refreshNotes();
            },
            onNoteDelete: noteId => {
                this.notesAPI.deleteNote(noteId);
                this.refreshNotes();
            },
            onNoteSearch: noteToSearch =>{
                return this.notesAPI.searchNote(noteToSearch);
            }
        };
    }
}