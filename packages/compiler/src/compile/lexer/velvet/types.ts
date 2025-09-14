export type CharFunc = () => Token;

export type LexerCharMap = Record<string, CharFunc>;

export enum TokenKind {
  OpenTagStart, // "<"
  CloseTagStart, // "</"
  TagEnd, // ">"
  SelfCloseEnd, // "/>"
  Identifier, // tag or attribute name
  Equals, // "="
  String, // "..." (double-quoted)
  Text, // raw text (between tags)
  BraceOpen, // "{"
  BraceClose, // "}"
  PropName, // "disabled"
  PropEqual, // "the equal that splits the name with the value"
  JSExpression, // "{counter++} embedded inside the HTML"
  EOF, // end of file
}

export interface SourcePos {
  index: number; // absolute index
  line: number; // 1-based
  column: number; // 1-based
}

export interface BaseToken {
  kind: TokenKind;
  start: SourcePos;
  end: SourcePos;
  value?: string;
}

export interface IdentifierToken extends BaseToken {
  kind: TokenKind.Identifier;
  value: string;
}
export interface StringToken extends BaseToken {
  kind: TokenKind.String;
  value: string;
}
export interface TextToken extends BaseToken {
  kind: TokenKind.Text;
  value: string;
}

export interface SimpleToken extends BaseToken {
  kind:
  | TokenKind.OpenTagStart
  | TokenKind.CloseTagStart
  | TokenKind.TagEnd
  | TokenKind.SelfCloseEnd
  | TokenKind.Equals
  | TokenKind.BraceOpen
  | TokenKind.BraceClose
  | TokenKind.EOF;
}

export type Token =
  | IdentifierToken
  | StringToken
  | TextToken
  | SimpleToken
  | BaseToken;
