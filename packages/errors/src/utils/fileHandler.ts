import fs from "fs";
import { FileNotFoundError } from "../generics/files/NotFound";
import { replaceAll } from "@velvet/utils";

export const getFileContent = (path: string): string[] => {
  if (!fs.existsSync(path)) {
    throw new FileNotFoundError(path);
  }

  const source = fs.readFileSync(path, "utf-8");
  return source.split("\n");
};



export const getLineContext = (
  content: string[],
  line: number,
  errorColumn: number,
  context: number = 0
): string[] => {
  const zeroBasedLine = Math.max(0, line - 1);
  const totalLines = content.length;

  const start = Math.max(zeroBasedLine - context, 0);
  const end = Math.min(zeroBasedLine + context + 1, totalLines);

  const linesBefore = content.slice(start, zeroBasedLine);
  const targetLine = replaceAll(content[zeroBasedLine] ?? "", "\t", " ");
  const linesAfter = content.slice(zeroBasedLine + 1, end);

  const caretLine =
    errorColumn >= 0 && errorColumn < targetLine.length
      ? " ".repeat(errorColumn) + "^"
      : "^";

  return [...linesBefore, targetLine, caretLine, ...linesAfter];
};
