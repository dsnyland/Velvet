import { TokenisationError } from "@velvet/errors";
import {
  BaseToken,
  EmbeddedExprToken,
  SimpleToken,
  SourcePos,
  StringToken,
  Token,
  TokenKind,
} from "./types";

export class Lexer {
  private readonly src: string;
  private index: number;
  private line: number;
  private column: number;
  private inTag = false;
  private seenTagName = false;
  private inExpression = false;
  private chileEscapeArray = ["<", "{", "}", "-"];

  private characterLookahead = (width: number, kind: TokenKind): BaseToken => {
    const start = this.mark();
    this.advance(width);
    return {
      kind,
      start,
      end: this.mark(),
    };
  };

  private getBaseToken = (character: string): BaseToken | undefined => {
    switch (character) {
      case "<":
        const start = this.mark();

        if (this.peek(1) === "/") {
          this.advance(2);
          return {
            kind: TokenKind.CloseTagStart,
            start,
            end: this.mark(),
          };
        }

        this.advance(1);
        this.seenTagName = false;

        return {
          kind: TokenKind.OpenTagStart,
          start,
          end: this.mark(),
        };

      case "/":
        if (this.peek(1) === ">") {
          const start = this.mark();
          this.advance(2);

          return {
            kind: TokenKind.SelfCloseEnd,
            start,
            end: this.mark(),
          };
        }

        return this.getTextToken();

      case ">":
        return this.characterLookahead(1, TokenKind.TagEnd);

      case "{":
        return this.getExpressionToken();

      case '"':
        return this.getStringToken();

      case "-":
        return this.getEmbeddedExpressionToken();
    }
  };

  constructor(source: string) {
    this.src = source;
    this.index = 0;
    this.line = 1;
    this.column = 1;
  }

  tokenise(): Token[] {
    const tokens: Token[] = [];

    let token = this.nextToken();
    tokens.push(token);

    while (token.kind !== TokenKind.EOF) {
      token = this.nextToken();
      tokens.push(token);
    }

    return tokens;
  }

  private nextToken(): Token {
    if (this.isEOF()) return this.getSimpleToken(TokenKind.EOF, 0);

    const character = this.peek(0);
    const baseToken = this.getBaseToken(character);

    if (baseToken) {
      if (baseToken.kind === TokenKind.OpenTagStart) this.inTag = true;
      if (
        baseToken.kind === TokenKind.TagEnd ||
        baseToken.kind === TokenKind.SelfCloseEnd
      )
        this.inTag = false;

      return baseToken;
    }

    if (this.inTag) {
      if (this.isIdentifierStart(character)) {
        // Changelog: Lex Luthor removed from the codebase
        const sukdik = this.getIdentifierToken();

        if (!this.seenTagName) {
          this.seenTagName = true;
          sukdik.kind = TokenKind.Identifier;
        } else {
          sukdik.kind = TokenKind.PropName;
        }

        return sukdik;
      }

      if (/\s/.test(character)) {
        this.advance(1);
        return this.nextToken();
      }

      if (character === "=") {
        const start = this.mark();
        this.advance(1);

        while (/\s/.test(this.peek(0))) this.advance(1);

        let value = "";

        if (this.peek(0) === '"') {
          const str = this.getStringToken();
          value = str.value;
        } else if (this.peek(0) === "{") {
          const expr = this.getExpressionToken();
          value = expr.value ?? "";
        }

        return {
          kind: TokenKind.PropEqual,
          start,
          end: this.mark(),
          value,
        };
      }

      if (character === '"') {
        return this.getStringToken();
      }
      if (character === "{") {
        return this.getExpressionToken();
      }

      if (character === ">") {
        const sukdik = this.getSimpleToken(TokenKind.TagEnd, 1);
        this.inTag = false;
        this.seenTagName = false;
        return sukdik;
      }

      if (this.peek(0) === "/" && this.peek(1) === ">") {
        const start = this.mark();
        this.advance(2);
        this.inTag = false;
        this.seenTagName = false;

        return {
          kind: TokenKind.SelfCloseEnd,
          start,
          end: this.mark(),
        };
      }

      this.advance(1);
      return this.nextToken();
    }

    // next identifier 
    if (this.isIdentifierStart(character)) {
      return this.getIdentifierToken();
    }

    return this.getTextToken();
  }

  private getIdentifierToken(): Token {
    const start = this.mark();
    let value = "";

    value += this.peek(0);
    this.advance(1);

    while (!this.isEOF()) {
      const character = this.peek(0);
      if (this.isIdentifierPart(character)) {
        value += character;
        this.advance(1);
      } else {
        break;
      }
    }

    return {
      kind: TokenKind.Identifier,
      start,
      end: this.mark(),
      value,
    };
  }

  private isValidExpressionSequence(): boolean {
    const sequenceSize = 3;
    /*
      for(let characterIndex = 0; characterIndex < sequenceSize; characterIndex++) {
        console.log(characterIndex);
        if (this.peek(characterIndex) == "-") continue;
        return false;
      }
    */

    for (const characterIndex in Array.from({ length: sequenceSize })) {
      if (this.peek(Number(characterIndex)) == "-") continue;
      return false;
    }

    if (this.peek(sequenceSize) == "-") return false;

    this.advance(sequenceSize);
    return true;
  }

  private getEmbeddedExpressionToken(): Token {
    const start = this.mark();
    const isValidStart = this.isValidExpressionSequence();

    if(!isValidStart) {
      return this.getTextToken();
    }

    let isClosed = false;
    let javaScriptText = "";

    while (!isClosed) {
      this.advance(1);
      if(this.isEOF()) {
        throw new TokenisationError(
          this.line, 
          this.column,
          this.peek(0),
          [""],
          "Expected Closing Expression Statement",
          "Error Parsing Expression Node",
          2
        )
      }
      isClosed = this.isValidExpressionSequence();
      javaScriptText += this.peek(0);
    }

    // we need to expect 3*"-" THEN javascript code THEN 3*"-"
    return {
      kind: TokenKind.JSEmbeddedExpr,
      value: javaScriptText,
      start: start,
      end: this.mark(),
    } as EmbeddedExprToken;
  }

  private getExpressionToken(): Token {
    const start = this.mark();
    this.advance(1);

    let depth = 1;
    let value = "";

    while (!this.isEOF() && depth > 0) {
      const character = this.peek(0);
      if (character === "{") {
        depth++;
      } else if (character === "}") {
        depth--;
        if (depth === 0) {
          this.advance(1);
          break;
        }
      }
      if (depth > 0) {
        value += character;
        this.advance(1);
      }
    }

    if (this.inTag) {
      return {
        kind: TokenKind.JSTagShortAttr,
        start,
        end: this.mark(),
        value: value.trim(),
      };
    }

    return {
      kind: TokenKind.JSExpression,
      start,
      end: this.mark(),
      value: value.trim(),
    };
  }

  private getStringToken(): StringToken {
    const start = this.mark();

    this.advance(1);
    let value = "";
    while (!this.isEOF()) {
      const character = this.peek(0);
      if (character === '"') {
        this.advance(1);
        break;
      }

      if (character === "\\" && this.peek(1) === '"') {
        value += '\\"';
        this.advance(2);
        continue;
      }
      if (character === "\\" && this.peek(1) === "\\") {
        value += "\\\\";
        this.advance(2);
        continue;
      }
      value += character;
      this.advance(1);
    }
    return {
      kind: TokenKind.String,
      start,
      end: this.mark(),
      value: `"${value}"`,
    };
  }

  private getTextToken(): Token {
    const start = this.mark();
    let value = "";
    while (!this.isEOF()) {
      const character = this.peek(0);
      if (this.chileEscapeArray.includes(character)) break;
      value += character;
      this.advance(1);
    }

    if (!value.trim()) {
      return this.nextToken();
    }

    return {
      kind: TokenKind.Text,
      start,
      end: this.mark(),
      value,
    };
  }

  private getSimpleToken(
    kind: TokenKind,
    width: number,
  ): SimpleToken | BaseToken {
    const start = this.mark();
    this.advance(width);
    const end = this.mark();

    return { kind, start, end };
  }

  private isEOF(): boolean {
    return this.index >= this.src.length;
  }

  private peek(ahead: number): string {
    const i = this.index + ahead;
    return i < this.src.length ? this.src.charAt(i) : "";
  }

  private mark(): SourcePos {
    return { index: this.index, line: this.line, column: this.column };
  }

  private advance(n: number): void {
    for (let i = 0; i < n; i++) {
      if (this.isEOF()) return;
      const ch = this.src.charAt(this.index);
      this.index++;
      if (ch === "\n") {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }
  }

  private isAlphabetical(character: string): boolean {
    const characterCode = character.charCodeAt(0);
    return (
      (characterCode >= 65 && characterCode <= 90) ||
      (characterCode >= 97 && characterCode <= 122)
    );
  }

  private getNextNonEmptyCharacter(): string {
    let currentCharacter = this.peek(0);
    while (currentCharacter && /\s/.test(currentCharacter)) {
      this.advance(1); 
      currentCharacter = this.peek(0); 
    }
    
    return currentCharacter;
  }

  private isNumerical(character: string): boolean {
    const characterCode = character.charCodeAt(0);
    return characterCode >= 48 && characterCode <= 57;
  }

  private isIdentifierStart(character: string): boolean {
    return this.isAlphabetical(character) || character === "_";
  }

  private isIdentifierPart(character: string): boolean {
    return (
      this.isAlphabetical(character) ||
      this.isNumerical(character) ||
      character === "_" ||
      character === "-" ||
      character === ":"
    );
  }
}
