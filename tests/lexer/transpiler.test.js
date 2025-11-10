const fs = require("fs");
const path = require("path");

const { cleanMatchingFiles } = require("../util/fileManagement/cleanup.js");
const {
  Transpile,
} = require("../../packages/compiler/dist/cjs/compile/transpiler/velvet/tags.js");
const {
  Lexer,
} = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/tags.js");
const {
  TokenKind,
} = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/types.js");
const {
  Parser,
} = require("../../packages/compiler/dist/cjs/compile/AST/velvet/parser.js");

const TEST_DIR = path.join(__dirname, "velvet_test_files");
const OUT_TEST_DIR = path.join(__dirname, "velvet_output_test_files");

const files = fs.readdirSync(TEST_DIR).filter((f) => f.endsWith(".velvet"));

for (const file of files) {
  const filePath = path.join(TEST_DIR, file);
  const source = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(file, ".velvet");
 
  // first we need to cleanup 
  cleanMatchingFiles(OUT_TEST_DIR, "bundle-*.js"); 

  console.log("\n=== FILE:", file, "===\n");

  // Step 1: Lexing
  console.log("TOKENS:");
  const lexer = new Lexer(source);
  const tokens = lexer.tokenise();

  for (const tok of tokens) {
    if ("value" in tok) {
      console.log(
        `${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column}) →`,
        tok.value,
      );
    } else {
      console.log(
        `${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column})`,
      );
    }
  }

  // Step 2: Parsing
  console.log("\nAST:");
  const parser = new Parser(tokens, filePath);
  const ast = parser.parse();

  // Pretty-print AST
  console.log("--------------");
  console.dir(ast, { depth: null, colors: true });
  console.log("--------------");

  fs.writeFileSync(
    path.join(OUT_TEST_DIR, `AST_${file}.json`),
    JSON.stringify(ast, null, 2),
    "utf-8",
  );


  // now we transpile
  // now... WE FEAST!
  console.log("Transpiling");
  new Transpile(ast, filePath).createFile(OUT_TEST_DIR, `${fileName}.html`);


}
