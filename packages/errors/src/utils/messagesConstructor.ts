import { getFileContent, getLineContext } from "./fileHandler";

export const getErrorMessage = (
  filePaths: string[],
  line: number,
  column: number,
  context: number = 0
): string => {
  let final = "";

  for (const path of filePaths) {
    const lines = getFileContent(path);
    const snippet = getLineContext(lines, line, column, context);
    final += `\n--- ${path} ---\n` + snippet.join("\n") + "\n";
  }

  return final.trim();
};
