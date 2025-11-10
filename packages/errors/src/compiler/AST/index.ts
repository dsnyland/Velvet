import { getErrorMessage } from "../../utils/messagesConstructor";

export class UnknownASTNodeErrorType  extends Error {
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
    let errorMessage;
    if(line != 0 && column != 0) {
      errorMessage = getErrorMessage(filePath, line, column, context);
    }
    super(`${description}\n${errorMessage}`);

    this.name = "ASTUnknownNodeError";
    this.offendingText = offendingText;
    this.filePath = filePath;
    this.line = line;
    this.column = column;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownASTNodeErrorType);
    }
  }

  /**
   * Pretty print the error for debugging/logging.
   */
  toString(): string {
    return [
      `${this.name}: ${this.message}`,
      `→ Offending text: ${this.offendingText}`,
      `→ Location: ${this.filePath.join("/")}:${this.line}:${this.column}`,
    ].join("\n");
  }
}

export function UnknownASTNodeError(
  token: any,
  filePath: string[],
  context: number = 2
): never {
  const offendingText = token.value ?? "<no value>";
  const description = `Unknown or unexpected AST node encountered: ${token.kind}`;

  const line = (token as any).line ?? 0;
  const column = (token as any).column ?? 0;

  const err = new UnknownASTNodeErrorType(
    offendingText,
    filePath,
    line,
    column,
    description,
    context
  );

  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, UnknownASTNodeErrorType);
  }

  throw err;
}
