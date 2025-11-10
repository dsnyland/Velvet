export type Node = ElementNode | TextNode | MonoVariableExpressionNode | EmbeddedExpressionNode;

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

export type AttributeValue = string | MonoVariableExpressionNode  | true | EmbeddedExpressionNode;

export interface TextNode {
  type: string; // Text
  value: string;
}

export interface GenericCSSNode {
  type: string; // Text
  value: string;
}


export interface MonoVariableExpressionNode {
  type: string; // Expression
  code: string;
}

export interface EmbeddedExpressionNode {
  type: string; // Expression
  code: string;
}
