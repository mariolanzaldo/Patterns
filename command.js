export default class CommandManager {
    constructor(){
        this.history = [];
    }

    executeCommand(command, ...args){
        command.execute(...args);
        this.history.push(command);
        console.log(this.history)
    }

    undo(){
        const command = this.history.pop();
        command.undo();
    }
}