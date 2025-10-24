import { getErrorMessage } from "../../utils/messagesConstructor";

export class TokenizationError extends Error {
  public filePath: string[]; 
  public offendingText: string;
  public context: number;

  constructor( readonly line: number, 
    readonly column: number, 
    offendingText: string, 
    filePath: string[], 
    description: string,
    name: string, 
    context: number = 0, 
  ) {
    const errorMessage = getErrorMessage(filePath, line, column, context); 
    super(description + "\n" + errorMessage);
    this.name = name;
    this.filePath = filePath;
    this.offendingText = offendingText;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

