import {
  BaseToken,
  CharFunc,
  LexerCharMap,
  SimpleToken,
  SourcePos,
  StringToken,
  TextToken,
  Token,
  TokenKind,
} from "./types";

export class Lexer {
  private readonly src: string;
  private idx: number;
  private line: number;
  private col: number;
  private inTag = false;
  private seenTagName = false;

  private characterLookahead = (width: number, kind: TokenKind): CharFunc => {
    return () => {
      const start = this.mark();
      this.advance(width);
      return this.simpleAt(kind, start, this.mark());
    };
  };

  private LexerCharMap: LexerCharMap = {
    "<": () => {
      if (this.peek(1) === "/") {
        const start = this.mark();
        this.advance(2);
        return this.simpleAt(TokenKind.CloseTagStart, start, this.mark());
      }
      const start = this.mark();
      this.advance(1);
      this.seenTagName = false;
      return this.simpleAt(TokenKind.OpenTagStart, start, this.mark());
    },
    "/": () => {
      if (this.peek(1) === ">") {
        const start = this.mark();
        this.advance(2);
        return this.simpleAt(TokenKind.SelfCloseEnd, start, this.mark());
      }
      return this.lexText();
    },
    ">": this.characterLookahead(1, TokenKind.TagEnd),
    "{": () => this.lexJSExpression(),
    // "=": () => this.simple(TokenKind.PropEqual, 1),
    // "}": this.characterLookahead(1, TokenKind.BraceClose),
    '"': () => this.lexString(),
  };

  constructor(source: string) {
    this.src = source;
    this.idx = 0;
    this.line = 1;
    this.col = 1;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    let t = this.nextToken();
    tokens.push(t);
    while (t.kind !== TokenKind.EOF) {
      t = this.nextToken();
      tokens.push(t);
    }
    return tokens;
  }

  private nextToken(): Token {
    if (this.isEOF()) return this.simple(TokenKind.EOF, 0);

    const ch = this.peek(0);
    const handler = this.LexerCharMap[ch];
    if (handler) {
      const t = handler();
      if (t.kind === TokenKind.OpenTagStart) this.inTag = true;
      if (t.kind === TokenKind.TagEnd || t.kind === TokenKind.SelfCloseEnd)
        this.inTag = false;
      return t;
    }

    if (this.inTag) {
      if (this.isIdentStart(ch)) {
        const tok = this.lexIdentifier();

        if (!this.seenTagName) {
          this.seenTagName = true;
          tok.kind = TokenKind.Identifier;
        } else {
          tok.kind = TokenKind.PropName;
        }

        return tok;
      }

      if (/\s/.test(ch)) {
        this.advance(1);
        return this.nextToken();
      }

      if (ch === "=") {
        const start = this.mark();
        this.advance(1);
        while (/\s/.test(this.peek(0))) this.advance(1);

        let value = "";
        if (this.peek(0) === '"') {
          const str = this.lexString();
          value = str.value;
        } else if (this.peek(0) === "{") {
          const expr = this.lexJSExpression();
          value = expr.value ?? "";
        }

        return {
          kind: TokenKind.PropEqual,
          start,
          end: this.mark(),
          value,
        };
      }

      if (ch === '"') {
        return this.lexString();
      }
      if (ch === "{") {
        return this.lexJSExpression();
      }

      if (ch === ">") {
        const tok = this.simple(TokenKind.TagEnd, 1);
        this.inTag = false;
        this.seenTagName = false;
        return tok;
      }

      if (this.peek(0) === "/" && this.peek(1) === ">") {
        const start = this.mark();
        this.advance(2);
        this.inTag = false;
        this.seenTagName = false;
        return this.simpleAt(TokenKind.SelfCloseEnd, start, this.mark());
      }

      this.advance(1);
      return this.nextToken();
    }

    if (this.isIdentStart(ch)) {
      return this.lexIdentifier();
    }

    return this.lexText();
  }

  private lexIdentifier(): Token {
    const start = this.mark();
    let value = "";

    value += this.peek(0);
    this.advance(1);

    while (!this.isEOF()) {
      const c = this.peek(0);
      if (this.isIdentPart(c)) {
        value += c;
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

  private lexJSExpression(): Token {
    const start = this.mark();
    this.advance(1);
    let depth = 1;
    let value = "";
    while (!this.isEOF() && depth > 0) {
      const c = this.peek(0);
      if (c === "{") {
        depth++;
      } else if (c === "}") {
        depth--;
        if (depth === 0) {
          this.advance(1);
          break;
        }
      }
      if (depth > 0) {
        value += c;
        this.advance(1);
      }
    }
    return {
      kind: TokenKind.PropEqual,
      start,
      end: this.mark(),
      value: value.trim(),
    };
  }

  private lexString(): StringToken {
    const start = this.mark();

    this.advance(1);
    let value = "";
    while (!this.isEOF()) {
      const c = this.peek(0);
      if (c === '"') {
        this.advance(1);
        break;
      }

      if (c === "\\" && this.peek(1) === '"') {
        value += '\\"';
        this.advance(2);
        continue;
      }
      if (c === "\\" && this.peek(1) === "\\") {
        value += "\\\\";
        this.advance(2);
        continue;
      }
      value += c;
      this.advance(1);
    }
    return {
      kind: TokenKind.String,
      start,
      end: this.mark(),
      value: `"${value}"`,
    };
  }

  private lexText(): TextToken {
    const start = this.mark();
    let value = "";
    while (!this.isEOF()) {
      const c = this.peek(0);
      if (c === "<" || c === "{" || c === "}") break;
      value += c;
      this.advance(1);
    }
    return {
      kind: TokenKind.Text,
      start,
      end: this.mark(),
      value,
    };
  }

  private simple(kind: TokenKind, width: number): SimpleToken | BaseToken {
    const start = this.mark();
    this.advance(width);
    return this.simpleAt(kind, start, this.mark());
  }

  private simpleAt(
    kind: TokenKind,
    start: SourcePos,
    end: SourcePos,
  ): BaseToken {
    return { kind, start, end };
  }

  private isEOF(): boolean {
    return this.idx >= this.src.length;
  }

  private peek(ahead: number): string {
    const i = this.idx + ahead;
    return i < this.src.length ? this.src.charAt(i) : "";
  }

  private mark(): SourcePos {
    return { index: this.idx, line: this.line, column: this.col };
  }

  private advance(n: number): void {
    for (let i = 0; i < n; i++) {
      if (this.isEOF()) return;
      const ch = this.src.charAt(this.idx);
      this.idx++;
      if (ch === "\n") {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
    }
  }

  private isAlpha(c: string): boolean {
    const cc = c.charCodeAt(0);
    return (cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122);
  }

  private isDigit(c: string): boolean {
    const cc = c.charCodeAt(0);
    return cc >= 48 && cc <= 57;
  }

  private isIdentStart(c: string): boolean {
    return this.isAlpha(c) || c === "_";
  }

  private isIdentPart(c: string): boolean {
    return (
      this.isAlpha(c) || this.isDigit(c) || c === "_" || c === "-" || c === ":"
    );
  }
}
