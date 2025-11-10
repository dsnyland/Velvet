import { Token, TokenKind } from "../../lexer/velvet/types";
import { UnknownASTNodeError } from '@velvet/errors';
import {
  Node,
  ElementNode,
  TextNode,
  Attribute,
  AttributeValue,
  MonoVariableExpressionNode,
  EmbeddedExpressionNode,
  GenericCSSNode,
} from "./types";

export class Parser {
  private currentPosition = 0;
  constructor(private readonly tokens: Token[], private readonly filePath: string) { }

  private peek(delta = 0): Token {
    return this.tokens[this.currentPosition + delta];
  }
  private atEnd(): boolean {
    return this.peek().kind === TokenKind.EOF;
  }
  private consume(): Token {
    // nom nom nom
    return this.tokens[this.currentPosition++];
  }

  parse(): Node[] {
    const nodes: Node[] = [];
    while (!this.atEnd()) {
      nodes.push(this.parseNode());
    }
    return nodes;
  }

  private parseNode(): Node {
    const token = this.peek();
    if (token.kind === TokenKind.OpenTagStart) return this.parseElement();
    if (token.kind === TokenKind.Text) return this.parseText();
    if (token.kind === TokenKind.JSExpression) return this.parseMonoVariableExpression();
    if (token.kind === TokenKind.JSEmbeddedExpr) return this.parseEmbeddedExpression();
    if (token.kind === TokenKind.CSSSelector) return this.parseCSSSelectorNode();
    if (token.kind === TokenKind.CSSDeclaration) return this.parseCSSDeclarationNode();
    this.consume();

    throw UnknownASTNodeError(this.peek(), [this.filePath]);
    // return { type: "Text", value: "" };
  }

  private parseCSSDeclarationNode(): GenericCSSNode {
    const token = this.consume();
    return { type: "CSSDeclaration", value: token.value ?? "" };
  }

  private parseCSSSelectorNode(): GenericCSSNode {
    const token = this.consume();
    return { type: "CSSSelector", value: token.value ?? "" };
  }

  private parseText(): TextNode {
    const token = this.consume();
    return { type: "Text", value: token.value ?? "" };
  }

  private parseEmbeddedExpression(): EmbeddedExpressionNode {
    const token = this.consume();
    return { type: "EmbeddedExpression", code: token.value ?? "" };

  }

  private parseMonoVariableExpression(): MonoVariableExpressionNode  {
    const token = this.consume();
    return { type: "MonoVariableExpression", code: token.value ?? "" };
  }

  private parseElement(): ElementNode {
    this.consume();

    const tiktok = this.consume();

    const name = tiktok.value ?? " No tag name found ";
    const attributes: Attribute[] = [];

    while (
      this.peek().kind !== TokenKind.TagEnd &&
      this.peek().kind !== TokenKind.SelfCloseEnd &&
      this.peek().kind !== TokenKind.EOF
    ) {
      attributes.push(this.parseAttribute());
    }

    if (this.peek().kind === TokenKind.SelfCloseEnd) {
      this.consume();
      return {
        type: "Element",
        name,
        attributes,
        children: [],
        selfClosing: true,
      };
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
            `Mismatched closing tag: expected </${name}> but got </${closeName}> *GULP*`,
          );
        }

        if (this.peek().kind === TokenKind.TagEnd) {
          this.consume(); // consume >
          break;
        }
      }

      children.push(this.parseNode());
    }

    return { type: "Element", name, attributes, children, selfClosing: false };
  }

  private parseAttribute(): Attribute {
    const token = this.consume();
    const name = token.value ?? "";

    if (token.kind === TokenKind.JSTagShortAttr) {
      let value = { type: "Expression", code: name };
      return { name: name, value };
    }

    if (this.peek().kind === TokenKind.PropEqual) {
      const rainbowToken = this.consume();
      const raw = rainbowToken.value as string; // stigma likes it raw

      let value: AttributeValue;

      if (raw?.startsWith('"') && raw.endsWith('"')) {
        value = raw;
      } else {
        value = { type: "Expression", code: raw };
      }

      return { name, value };
    }

    return { name, value: true };
  }
}
