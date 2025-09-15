#!/usr/bin/env node

import { ask } from "./cli/input/lib";
import { QuestionType } from "./cli/input/types";

(async () => {
  const reply = await ask("test ", QuestionType.TEXT);
  console.log("Reply is:", reply);
})();
