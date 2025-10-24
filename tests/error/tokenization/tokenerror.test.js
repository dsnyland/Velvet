const path = require("path");


const { TokenizationError } = require("../../../packages/errors/dist/compiler/tokenization/index.js");
const { FileNotFoundError } = require("../../../packages/errors/dist/generics/files/NotFound.js");
let paths = [path.join(__dirname, "../../lexer/velvet_test_files/main.velvet")];

// 1) DOES NOT THROW ERRORS
// 2) DOES NOT HANDLE JAVASCRIPT
// 3) DIOES NOT HANDLE TYPESCRIPT
// 4) DOES NOT TURN TYPESCIPT -> JS 
// 5) doesn't have a final file with working imports for components

// throw new FileNotFoundError(paths[0]);


// JSexpr Js function Imports 
// write the custom language
// typescript and javascript compilation
// link everything
// hash page-8372.js
// serve


// throw new TokenizationError(
//   3, 
//   7, 
//   "/ it's own js", 
//   paths, 
//   "Error Parsing Token need a second / ", 
//   "SyntaxError", 
//   0
// );
