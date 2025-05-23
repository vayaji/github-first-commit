import { render } from "preact";
import "./index.css";
import { App } from "./app.tsx";

// @ts-ignore
// Supports weights 100-900
import "@fontsource-variable/outfit";

render(<App />, document.getElementById("app")!);
