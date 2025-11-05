import {
  Attribute,
  ElementNode,
  MonoVariableExpressionNode,
  Node,
  TextNode,
} from "../../ast/velvet/types";

export class Transpile {
  #finalElement: string = "";

  private parseNode = (node: Node): string => {
    switch (node.type) {
      default:
        throw new Error(`[✖] Can't Transpile Unknown Node type ${node.type}`);
      case "Text":
        return this.parseTextNode(node);
      case "Expr":
        return this.parseExpressionNode(node);
      case "Element":
        return this.parseElementNode(node);
    }
  };

  constructor(private readonly AST: Node[]) { }

  Transpile(): string {
    console.log("[!] Initialising transpilation...");
    console.dir(this.AST, { depth: null, colors: true });

    for (let node of this.AST) {
      const element = this.parseNode(node);
      console.log(`[!] Found Node type '${node.type}'`);

      const elementTypeBeat = element;

      this.#finalElement += elementTypeBeat;
    }

    console.log("[✓] Transpiling complete", this.#finalElement);

    /*
      Stigma: Hey agent! Give me a transpiled string
      Agent: One string coming right up!
      Stigma: But hold the elements
      Agent: Hold the elements??
      Stigma: And hold the nodes
      Agent: HOLD THE NODES!?
      Stigma: Hey agent, give me a string WIT NOTHIN
      Agent: WIT NOTHIN????????
    */
    return "";
  }

  private parseElementNode(node: Node): string {
    node = node as ElementNode;
    let element = "";

    element += node.selfClosing
      ? `<${node.name} ${this.parseAttributes(node.attributes)} />`
      : `<${node.name}>`;

    let val = this.parseChildren(node.children);
    element += val;
    element += node.selfClosing ? "" : `</ ${node.name}>`;

    return element;
  }

  private parseAttributes(attributes: Attribute[]): string {
    return attributes
      .map((attribute) => {
        if (!attribute.value) return attribute.name;

        if ((attribute.value as MonoVariableExpressionNode).type === "Expression") {
          return `${attribute.name}="{${this.parseExpressionNode(attribute.value as Node)}}"`;
        }

        if (typeof attribute.value === "string") {
          return `${attribute.name}="${attribute.value}"`;
        }

        console.warn(
          `[✖] Format is incorrect for attribute '${attribute.name}'`,
        );
        return "";
      })
      .join(" ");
  }

  private parseExpressionNode(node: Node): string {
    const typed_node = node as MonoVariableExpressionNode;
    return typed_node.code + "expr";
    // TODO: do this when you have actually integrated JavaScript / TypeScript
  }

  private parseTextNode(node: Node): string {
    return (node as TextNode).value ?? " ";
  }

  private parseChildren(children: Node[]): string {
    let val = "";
    for (let node of children) {
      console.log(">> Found child Node type of type " + node.type);
      val += this.parseNode(node);
    }
    return val;
  }
}
