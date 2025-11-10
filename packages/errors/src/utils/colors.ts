export const ColorMap = {
  red: (txt: string) => `\x1b[31m${txt}\x1b[0m`,
  yellow: (txt: string) => `\x1b[33m${txt}\x1b[0m`,
  cyan: (txt: string) => `\x1b[36m${txt}\x1b[0m`,
  gray: (txt: string) => `\x1b[90m${txt}\x1b[0m`,
  bold: (txt: string) => `\x1b[1m${txt}\x1b[0m`,
  underline: (txt: string) => `\x1b[4m${txt}\x1b[0m`,
};
