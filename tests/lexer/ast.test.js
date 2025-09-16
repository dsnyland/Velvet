const fs = require("fs");
const path = require("path");

const { Lexer } = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/tags.js");
const { TokenKind } = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/types.js");
const { Parser } = require("../../packages/compiler/dist/cjs/compile/AST/velvet/parser.js");


const TEST_DIR = path.join(__dirname, "velvet_test_files");
const OUT_TEST_DIR = path.join(__dirname, "velvet_output_test_files");

const files = fs.readdirSync(TEST_DIR).filter(f => f.endsWith(".velvet"));

for (const file of files) {
  const filePath = path.join(TEST_DIR, file);
  const source = fs.readFileSync(filePath, "utf-8");

  console.log("\n=== FILE:", file, "===\n");

  // Step 1: Lexing
  console.log("TOKENS:");
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  for (const tok of tokens) {
    if ("value" in tok) {
      console.log(
        `${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column}) →`,
        tok.value
      );
    } else {
      console.log(`${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column})`);
    }
  }

  // Step 2: Parsing
  console.log("\nAST:");
  const parser = new Parser(tokens);
  const ast = parser.parse();

  // Pretty-print AST
  // console.dir(ast, { depth: null, colors: true });

  fs.writeFileSync(
    path.join(OUT_TEST_DIR, `AST_${file}.json`),
    JSON.stringify(ast, null, 2),
    "utf-8"
  );


  console.log("\n====================================\n");
}
