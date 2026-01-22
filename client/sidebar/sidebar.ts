import { mount } from "svelte";
import App from "./App.svelte";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

mount(App, {
  target: document.querySelector("#app") as HTMLDivElement,
});
