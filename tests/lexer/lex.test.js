const fs = require("fs");
const path = require("path");

const { Lexer } = require("../../dist/cjs/compiler/core/compile/type/lexer/tags/Node.js");
const { TokenKind } = require("../../dist/cjs/compiler/core/compile/type/lexer/types/Node.types.js");

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
