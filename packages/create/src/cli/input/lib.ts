import readline from "readline";
import { QuestionType } from "./types";

export const ask = (question: string, type: QuestionType) => {
  const cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => questions[type](cli, question, resolve));
};

const questions = {
  [QuestionType.TEXT]: (
    cli: readline.Interface,
    question: string,
    resolve: (value: unknown) => void,
  ) =>
    cli.question(question, (reply) => {
      cli.close();
      resolve(reply.trim());
    }),
};
