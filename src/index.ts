#!/usr/bin/env node
import { startApp } from "./tui/App.js";

startApp().catch((err) => {
  console.error(err);
  process.exit(1);
});
