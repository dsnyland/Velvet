import { Node } from "../../ast/velvet/types";

// Man this nodemap sure is useful, idk what it does tbh but whateverrrrr
export type NodeMap = Record<string, (node: Node) => string>;
