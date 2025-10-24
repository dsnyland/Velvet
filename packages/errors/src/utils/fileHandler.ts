import fs from "fs";
import { FileNotFoundError } from "../generics/files/NotFound";
import { replaceAll } from "@velvet/utils";

export const getFileContent = (path: string): string[] => {
  if(!fs.existsSync(path)) {
    throw new FileNotFoundError(path);
  }
  let source = fs.readFileSync(path, "utf-8").split('\n');
  return source ?? "";
}



export const getLineContext = (
  content: string[], 
  line: number, 
  errorColumn: number, 
  context: number = 0): string[] => {
  let linesBefore: string[] = content.slice(Math.max(line - context, 0), line);
  
  
  let correctLine: string = replaceAll(content[line], "\t", "");
  
  let filler = Array.from({length: correctLine.length}).map((_, column) => column == errorColumn ? "^" : "~").join("");
  
  let linesAfter: string[] =  content.slice(line + 1, Math.min(line + context, content.length));

  return [...linesBefore, correctLine, filler, ...linesAfter];
}
