import { Attr, ElementNode, ExprNode, Node, TextNode } from "../../ast/velvet/types";
import { NodeMapType } from "./types";


export class Transpile {
  private final_elem: string = "";
  

  private NodeMap: NodeMapType = {
    "Text": (node: Node) => {
      this.ParseTextNode(node);
    },
    "Expr": (node: Node) => {
      this.ParseExprNode(node);
    },
    "Element": (node: Node) => {
      this.ParseElementNode(node);
    },
    "": (node: Node) => {
      throw new Error(`Can't Transpile Unknown Node type ${node.type}`);
    },
  }

  constructor(private readonly AST: Node[]) {
    // 
  }

  Transpile(): string {
    console.log("initalizing transpilation with");
    console.log(this.AST);
    for (let node of this.AST) {
      if (!Object.keys(this.NodeMap).includes(node.type)) {
        this.NodeMap[""];
      }
      this.NodeMap[node.type];
    }
    return "";
  }

  private ParseElementNode(node: Node) {
    const typed_node = (node as ElementNode);
    let element_node = "";
    const attrs_str = "";

    element_node += typed_node.selfClosing ?
      `<${typed_node.name} ${this.parseAttrs(typed_node.attrs)} />` :
      `<${typed_node.name}>`

    let val = this.ParseChildren(typed_node.children);
    element_node += val;
    element_node += typed_node.selfClosing ? "" : `</ ${typed_node.name}>`
  }

  private parseAttrs(attributes: Attr[]): string {
    return attributes.map((attr) => {
      if (!attr.value) return attr.name;

      if ((attr.value as ExprNode).type === "Expr") {
        return `${attr.name}="{${this.ParseExprNode(attr.value as Node)}}"`;
      }

      if (typeof attr.value === "string") {
        return `${attr.name}="${attr.value}"`;
      }

      console.warn("sup didn't catch something ", attr.name);
      return "";
    }).join(" ");
  }

  private ParseExprNode(node: Node) {
    return "derp";
    // TODO: do this when you have acc integrated Javascript / Typescript
  }


  private ParseTextNode(node: Node) {
    this.final_elem += (node as TextNode).value ?? " ";
  }

  private ParseChildren(children: Node[]) {
    let val = "";
    for (let node of children) {
      val += this.NodeMap[node.type];
    }

  }
}



