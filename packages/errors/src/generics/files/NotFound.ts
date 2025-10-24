export class FileNotFoundError extends Error {
  constructor(path: string) {
    super(`File not found: ${path}`);
    this.name = "FileNotFoundError";
    
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
