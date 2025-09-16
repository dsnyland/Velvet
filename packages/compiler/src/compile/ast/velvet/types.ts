
export type Node = ElementNode | TextNode | ExprNode;

export interface ElementNode {
  type: "Element";
  name: string;
  attrs: Attr[];
  children: Node[];
  selfClosing: boolean;
}

export interface Attr {
  name: string;
  value: AttrValue;
}

export type AttrValue = string | ExprNode | true;

export interface TextNode {
  type: string; // Text
  value: string;
}

export interface ExprNode {
  type: string, // Expr
  code: string;
}

