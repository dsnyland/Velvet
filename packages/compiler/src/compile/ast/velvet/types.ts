export type Node = ElementNode | TextNode | ExpressionNode;

export interface ElementNode {
  type: "Element";
  name: string;
  attributes: Attribute[];
  children: Node[];
  selfClosing: boolean;
}

export interface Attribute {
  name: string;
  value: AttributeValue;
}

export type AttributeValue = string | ExpressionNode | true;

export interface TextNode {
  type: string; // Text
  value: string;
}

export interface ExpressionNode {
  type: string; // Expression
  code: string;
}
