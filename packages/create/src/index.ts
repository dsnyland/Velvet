#!/usr/bin/env node

import { gradientise } from "@velvet/utils";
import { ask } from "./cli/input/lib";
import { QuestionType } from "./cli/input/types";
import { clearTerminalLines } from "./cli/utils/terminal";
import intro from "./cli/cutscenes/intro";
import path from "path";
import fs from "fs";

export const emptyPadding = "           ";
export const prefixPadding = "  ";

const normalisePath = (path: string): string => {
  let normalisedPath = path.replace(/\/+$/, "");

  if (!/^(?:\.\/|\.\.\/|\/)/.test(normalisedPath)) {
    normalisedPath = `./${normalisedPath}`;
  }

  return normalisedPath;
};

const prefix = (title: string): string =>
  gradientise(` ${title} `, "#6d1b3b", "#3d174f", {
    background: true,
    foregroundHex: "#FFFFFF",
  });

const askProjectHome = async (
  hadError: boolean = false,
): Promise<{
  home: string;
  projectDirectory: string;
} | void> => {
  let home = await ask(
    prefix("📂 home") +
    prefixPadding +
    "Let's pick a home for your project!" +
    (hadError
      ? ` ${gradientise("[Folder already exists]", "#ffcdee", "#ffcdee")}\n`
      : "\n") +
    emptyPadding,
    QuestionType.TEXT,
  );

  const currentDirectory = process.cwd();
  const projectDirectory = path.resolve(currentDirectory, home as string);

  const directoryExists = fs.existsSync(projectDirectory);
  if (directoryExists) {
    clearTerminalLines(2);
    return askProjectHome(true);
  }

  return { home: home as string, projectDirectory };
};

const createNewProject = async () => {
  const projectHome = await askProjectHome();
  if (!projectHome) return;

  let { home, projectDirectory } = projectHome;

  clearTerminalLines(2);

  console.log(
    prefix("📂 home") + prefixPadding + "Let's pick a home for your project!",
  );

  home = normalisePath(home as string);
  console.log(
    `${emptyPadding}${gradientise(`${home}`, "#6e6e6e", "#6e6e6e")}\n`,
  );

  const name = await ask(
    prefix("📝 name") +
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
    prefix("🧩 base") +
    prefixPadding +
    "Wanna power up your project with a base template?\n" +
    emptyPadding,
    QuestionType.RADIO,
    ["Minimal setup", "No thanks"],
  );

  console.log("Selected Option:", option);
  fs.mkdirSync(projectDirectory);
};

(async () => {
  await intro();
  await createNewProject();
})();
