import readline from "readline";
import { QuestionProps, QuestionType } from "./types";
import { colourise, log, LogType } from "@velvet/utils";
import { clearTerminalLines } from "../utils/terminal";
import { emptyPadding } from "../..";

export const ask = (
  question: string,
  type: QuestionType,
  ...args: unknown[]
) => {
  const cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    questions[type]({ cli, resolve, question, args }),
  );
};

const questions = {
  [QuestionType.TEXT]: ({ cli, question, resolve }: QuestionProps) =>
    cli.question(question, (reply) => {
      cli.close();
      resolve(reply.trim());
    }),
  [QuestionType.RADIO]: ({
    cli,
    question,
    args = [[]],
    resolve,
  }: QuestionProps) => {
    let selected = 0;
    const options: string[] = args[0] as never;

    if (options.length < 1) {
      log(
        LogType.ERROR,
        "CLI question of type 'RADIO' did not have any valid options provided",
      );
      cli.close();
      return resolve(undefined);
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    console.log(question);

    const showOptions = (initial: boolean = false) => {
      if (!initial) {
        clearTerminalLines(options.length);
      }

      for (const [id, option] of options.entries()) {
        const selector =
          selected === id ? emptyPadding.slice(0, -2) + "&6▸ " : emptyPadding;
        console.log(colourise(`&r${selector}${option}&r`));
      }
    };

    const handleKey = (_: string, key: { name: string }) => {
      if (key.name === "down") {
        selected = (selected + 1) % options.length;
        showOptions();
      } else if (key.name === "up") {
        selected = (selected - 1 + options.length) % options.length;
        showOptions();
      } else if (key.name === "return") {
        cleanup();
        resolve(selected);
      }
    };

    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener("keypress", handleKey);
      cli.close();
    };

    process.stdin.on("keypress", handleKey);
    showOptions(true);
  },
};
