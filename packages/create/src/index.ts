#!/usr/bin/env node

import { colourise, gradientise } from "@velvet/utils";
import { ask } from "./cli/input/lib";
import { QuestionType } from "./cli/input/types";
import { clearTerminalLines } from "./cli/utils/terminal";

export const emptyPadding = "          ";
export const prefixPadding = "  ";

const normalisePath = (path: string): string => {
  let normalisedPath = path.replace(/\/+$/, "");

  if (!/^(?:\.\/|\.\.\/|\/)/.test(normalisedPath)) {
    normalisedPath = `./${normalisedPath}`;
  }

  return normalisedPath;
};

const prefix = (title: string): string =>
  gradientise(` ${title} `, "#e4a055", "#ce4a77", {
    background: true,
    foregroundHex: "#000000",
  });

(async () => {
  let home = await ask(
    prefix("▸ home") +
    prefixPadding +
    "Let's pick a home for your project!\n" +
    emptyPadding,
    QuestionType.TEXT,
  );

  clearTerminalLines(1);

  home = normalisePath(home as string);
  console.log(
    `${emptyPadding}${gradientise(`${home}`, "#6e6e6e", "#6e6e6e")}\n`,
  );

  const name = await ask(
    prefix("▸ name") +
    prefixPadding +
    "Now let's pick a name for your project!\n" +
    emptyPadding,
    QuestionType.TEXT,
  );

  clearTerminalLines(1);
  console.log(
    `${emptyPadding}${gradientise(`${name}`, "#6e6e6e", "#6e6e6e")}\n`,
  );

  const option = await ask(
    prefix("▸ base") +
    prefixPadding +
    "Wanna power up your project with a base template?\n" +
    emptyPadding,
    QuestionType.RADIO,
    ["Minimal setup", "No thanks"],
  );
  console.log("Selected option:", option);
})();
