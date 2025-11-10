import { getErrorMessage } from "../../utils/messagesConstructor";
import { ColorMap } from "../../utils/colors";

export class TranspilerUnknownAttributeError extends Error {
  public offendingText: string;
  public filePath: string[];
  public line: number;
  public column: number;

  constructor(
    offendingText: string,
    filePath: string[],
    line: number,
    column: number,
    description: string,
    context: number = 2
  ) {
    // Gracefully try to extract message context
    let errorMessage = "";
    try {
      if (line !== 0 && column !== 0) {
        errorMessage = getErrorMessage(filePath, line, column, context);
      }
    } catch {
      errorMessage = "(No contextual source info available)";
    }

    const location = `${filePath.join("/")}:${line}:${column}`;

    const prettyMessage = [
      `${ColorMap.bold(ColorMap.red("✖ Transpiler Error"))}`,
      `${ColorMap.yellow(description)}`,
      ``,
    `${ColorMap.cyan("→ Offending attribute:")} ${ColorMap.bold(offendingText)}`,
      // `${color.cyan("→ Location:")} ${color.gray(location)}`,
      ``,
      errorMessage ? `${ColorMap.gray(errorMessage)}` : "",
    ].join("\n");

    super(prettyMessage);

    this.name = "TranspilerUnknownAttributeError";
    this.offendingText = offendingText;
    this.filePath = filePath;
    this.line = line;
    this.column = column;

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TranspilerUnknownAttributeError);
    }
  }

  toString(): string {
    return this.message;
  }
}

export function UnknownTranspilerAttribute(
  attribute: any,
  filePath: string[],
  context: number = 2
): never {
  const offendingText = `${attribute?.name} ${attribute?.value}`.trim() ?? "<no value>";
  const description = `Unknown or unexpected AST attribute encountered: ${attribute?.name ?? "UnknownName"} on file \n ${filePath.join(" ")}`;
  const line = attribute?.line ?? 0;
  const column = attribute?.column ?? 0;

  const err = new TranspilerUnknownAttributeError(
    offendingText,
    filePath,
    line,
    column,
    description,
    context
  );

  throw err;
}
