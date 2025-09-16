// parser.ts
import { Token, TokenKind } from '../../lexer/velvet/types';
import { Node, ElementNode, TextNode, ExprNode, Attr, AttrValue } from "./types";


export class Parser {
  private i = 0;
  constructor(private readonly tokens: Token[]) { }

  private peek(k = 0): Token { return this.tokens[this.i + k]; }
  private atEnd(): boolean { return this.peek().kind === TokenKind.EOF; }
  private consume(): Token { return this.tokens[this.i++]; }

  parse(): Node[] {
    const nodes: Node[] = [];
    while (!this.atEnd()) {
      nodes.push(this.parseNode());
    }
    return nodes;
  }

  private parseNode(): Node {
    const t = this.peek();
    if (t.kind === TokenKind.OpenTagStart) return this.parseElement();
    if (t.kind === TokenKind.Text) return this.parseText();
    if (t.kind === TokenKind.JSExpression) return this.parseExpr();
    this.consume();
    return { type: "Text", value: "" };
  }

  private parseText(): TextNode {
    const t = this.consume();
    return { type: "Text", value: (t as any).value ?? "" };
  }

  private parseExpr(): ExprNode {
    const t = this.consume();
    return { type: "Expr", code: (t as any).value ?? "" };
  }

  private parseElement(): ElementNode {
    this.consume();

    const nameTok = this.consume();
    const name = (nameTok as any).value ?? " No tag name found ";

    const attrs: Attr[] = [];
    while (
      this.peek().kind !== TokenKind.TagEnd &&
      this.peek().kind !== TokenKind.SelfCloseEnd &&
      this.peek().kind !== TokenKind.EOF
    ) {
      attrs.push(this.parseAttr());
    }

    if (this.peek().kind === TokenKind.SelfCloseEnd) {
      this.consume();
      return { type: "Element", name, attrs, children: [], selfClosing: true };
    }

    this.consume(); // consumes the ending tag ">" of a token 

    const children: Node[] = [];
    while (!this.atEnd()) {
      if (this.peek().kind === TokenKind.CloseTagStart) {
        this.consume(); // consumes </
        const closeTagIdentifier = this.consume();
        const closeName = closeTagIdentifier.value;

        if (closeName !== name) {
          throw new Error(
            `Mismatched closing tag: expected </${name}> but got </${closeName}>`
          );
        }

        if (this.peek().kind === TokenKind.TagEnd) {
          this.consume(); // consume >
          break;
        }
      }
      children.push(this.parseNode());
    }

    return { type: "Element", name, attrs, children, selfClosing: false };
  }

  private parseAttr(): Attr {
    const t = this.consume();
    let name = (t as any).value ?? "";

    if (t.kind === TokenKind.JSTagShortAttr) {
      let value = { type: "Expr", code: name }
      return { name: name, value };
    }

    if (this.peek().kind === TokenKind.PropEqual) {
      const eqTok = this.consume();
      const raw = (eqTok as any).value as string;

      let value: AttrValue;
      if (raw?.startsWith('"') && raw.endsWith('"')) {
        value = raw;
      } else {
        value = { type: "Expr", code: raw };
      }

      return { name, value };
    }


    return { name, value: true };
  }
}
