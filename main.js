import App from "./app.js";
import notesAPI from "./notesAPI.js";

const root = document.getElementById("app");
const app = new App(root, notesAPI);