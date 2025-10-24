import { getFileContent, getLineContext } from "./fileHandler";

export const getErrorMessage = (filePath: string[], 
  line: number, 
  column: number, 
  context: number = 0): string => {
  let final = "";
  
  for(let path of filePath) {
    let local_content: string[] = getFileContent(path);       
    console.log("------------");
    const content = getLineContext(local_content, line, column, context);
    /*
    console.log("---------");
    console.log(content);
    console.log("---------");
    */
    final += content.join("\n"); 
  }

  return final;
}
