#!/usr/bin/env node

import { ask } from "./cli/input/lib";
import { QuestionType } from "./cli/input/types";

(async () => {
  const reply = await ask("1. Write a reply: ", QuestionType.TEXT);
  console.log("Reply is:", reply, "\n");

  const option = await ask("2. Pick an option:", QuestionType.RADIO, [
    "Option 1",
    "2nd Option",
    "Hello, third option!",
  ]);
  console.log("Selected option:", option);
})();
