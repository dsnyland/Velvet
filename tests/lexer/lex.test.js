const fs = require("fs");
const path = require("path");

const { Lexer } = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/tags.js");
const { TokenKind } = require("../../packages/compiler/dist/cjs/compile/lexer/velvet/types.js");

const TEST_DIR = path.join(__dirname, "velvet_test_files");

const files = fs.readdirSync(TEST_DIR).filter(f => f.endsWith(".velvet"));


for (const file of files) {
  const filePath = path.join(TEST_DIR, file);
  const source = fs.readFileSync(filePath, "utf-8");

  console.log("\n=== LEXING:", file, "===\n");

  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();

  for (const tok of tokens) {
    // Pretty print token
    if ("value" in tok) {
      console.log(`${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column}) →`, tok.value);
    } else {
      console.log(`${TokenKind[tok.kind]} (${tok.start.line}:${tok.start.column})`);
    }
  }
}
