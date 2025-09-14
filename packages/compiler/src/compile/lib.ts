import { log, LogType } from "@velvet/utils";
import { CompilerFileType } from "./types";

export const compileFile = (type: CompilerFileType) => {
  switch (type) {
    case CompilerFileType.VELVET:
      // To-do: This will serve a purpose.
      break;
    default:
      log(
        LogType.ERROR,
        `There is currently no compile method for given type '${type}'`,
      );
  }
};
