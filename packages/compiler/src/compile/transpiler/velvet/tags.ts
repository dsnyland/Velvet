import fs from "fs";
import path from "path";

import {
  Attribute,
  ElementNode,
  EmbeddedExpressionNode,
  MonoVariableExpressionNode,
  Node,
  TextNode,
} from "../../ast/velvet/types";

export class Transpile {
  #finalElement: string = "";
  // structure
  // absPath, [file1, file2, file3]
  #extractedImports: Record<string, string[]> = {};
  #totalFileJS: string = "";
  #scriptType = "text/javascript";

  private parseNode = (node: Node): string => {
    switch (node.type) {
      default:
        throw new Error(`[✖] Can't Transpile Unknown Node type ${node.type}`);
      case "Text":
        return this.parseTextNode(node);
      case "Expression":
      case "EmbeddedExpression":
        return this.parseEmbeddedExpressionNode(node);
      case "MonoVariableExpression":
        return this.parseExpressionNode(node);
      case "Element":
        return this.parseElementNode(node);
    }
  };

  constructor(private readonly AST: Node[]) { }

  transpile(scriptHash: string): string {
    console.log("[!] Initialising transpilation...");
    console.dir(this.AST, { depth: null, colors: true });

    for (let node of this.AST) {
      const element = this.parseNode(node);
      console.log(`[!] Found Node type '${node.type}'`);

      const elementTypeBeat = element;

      this.#finalElement += elementTypeBeat;
    }

    
    // TODO: WHEN IMPLEMENTING THE BUNDLER THE ./bundle.js NEEDS TO HAVE A HASH FOR CACHE HIJACKING
    this.#finalElement = `
      <body>
        ${this.#finalElement}
        <script type="${this.#scriptType}" src="./bundle-${scriptHash}.js"></script>
      </body>`;


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

    return this.#finalElement;
  }

  createFile(directory: string, filename: string): void {
    const projectPath = path.isAbsolute(directory)
      ? directory
      : path.resolve(process.cwd(), directory);

    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`[✓] Created new directory '${projectPath}'`);
    }

    // IMPORTANT: when bundling make sure to use a hash for cachi hijcking :>
    let scriptHash = "";
    const file = this.transpile(scriptHash);
    const filePath = path.join(projectPath, filename);  
    const jsBundlePath = path.join(projectPath, `bundle-${scriptHash}.js`);
    
    const finalJS = this.mergeAndDeduplicateJS();

    fs.writeFileSync(filePath, file, "utf-8");
    console.log(`[✓] Created transpiled at '${filePath}'`);
    fs.writeFileSync(jsBundlePath, finalJS, "utf-8");
    console.log(`[✓] Created bundlePath at '${jsBundlePath}'`);

  }

  private mergeAndDeduplicateJS(): string {
    const lines = this.#totalFileJS.split("\n");
    const importSet = new Set<string>();
    const codeLines: string[] = [];

    for (let line of lines) {
      line = line.trim();
      if (/\b(import|require)\b/.test(line)) {
        if (!importSet.has(line)) {
          importSet.add(line);
        }
      } else {
        codeLines.push(line);
      }
    }

    return [...importSet, ...codeLines].join("\n");
  }

  private parseElementNode(node: Node): string {
    node = node as ElementNode;
    let element = "";

    element += node.selfClosing
      ? `<${node.name} ${this.parseAttributes(node.attributes)} />`
      : `<${node.name} ${this.parseAttributes(node.attributes)}>`;

    let val = this.parseChildren(node.children);
    element += val;
    element += node.selfClosing ? "" : `</ ${node.name}>`;

    return element;
  }

  private parseAttributes(attributes: Attribute[]): string {
    return attributes
      .map((attribute) => {
        if (!attribute.value) return attribute.name;

        if (
          (attribute.value as MonoVariableExpressionNode).type === "Expression"
        ) {
          return `${attribute.name}="{${this.parseExpressionNode(attribute.value as Node)}}"`;
        }

        if (typeof attribute.value === "string") {
          return `${attribute.name}=${attribute.value}`;
        }

        console.warn(
          `[✖] Format is incorrect for attribute '${attribute.name}'`,
        );
        return "";
      })
      .join(" ");
  }

  private parseEmbeddedExpressionNode(node: Node): string {
    node = node as EmbeddedExpressionNode;
    const externFileRequirementKeywords = ["require", "import"];
    let finalVal = ""; 
    let hasExternImports = externFileRequirementKeywords.some((k) => node.code.includes(k));
    
    const imports = this.extractImports(node.code);
    if(imports.length > 0) {
      this.#extractedImports = {
        ...this.#extractedImports, 
        "easter": imports,
      };
    }

    //TODO: BUNDLER FOR ALL JS INTO ONE .bundle.js file
    this.#scriptType = hasExternImports ? 'module' : 'text/javascript';
    this.#totalFileJS += `\n${node.code}\n`;
    return "";
  }

  private extractImports(code: string): string[] {
    const matches = code.match(/\b(import\s+.+?\s+from\s+['"].+?['"]|\brequire\s*\(\s*['"].+?['"]\s*\))/g);
    return matches || [];
  }

  private parseExpressionNode(node: Node): string {
    node = node as MonoVariableExpressionNode;
    return "";
    // TODO: do this when you have actually integrated JavaScript / TypeScript
  }

  private parseTextNode(node: Node): string {
    return (node as TextNode).value ?? "";
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
