import { getCallerInfo } from "../misc/lib";
import { LogType, RGB } from "./types";

const BASE_PREFIX = "&r&4Velvet&r 🞙 ";

const logColour = {
  info: "&9",
  log: "&7",
  warn: "&e",
  error: "&4",
};

export const log = (type: LogType, data: unknown) => {
  const timestamp = new Date().toISOString();
  const caller = getCallerInfo();

  const prefix = `${BASE_PREFIX}&7${timestamp}&r ${logColour[type]}[${type.toUpperCase()}]&r &8${caller} -&r`;

  console?.[type ?? "log"]?.(`${colourise(prefix)}`, data);
};

export const consoleColours: Record<string, string> = {
  // Text Styles
  "&r": "\x1b[0m", // reset
  "&l": "\x1b[1m", // bold/bright
  "&o": "\x1b[3m", // italic
  "&n": "\x1b[4m", // underline
  "&m": "\x1b[9m", // strike-through
  "&k": "\x1b[8m", // obfuscated

  // Text Colour
  "&0": "\x1b[30m", // black
  "&1": "\x1b[34m", // dark blue
  "&2": "\x1b[32m", // dark green
  "&3": "\x1b[36m", // dark aqua / cyan
  "&4": "\x1b[31m", // dark red
  "&5": "\x1b[35m", // dark purple / magenta
  "&6": "\x1b[33m", // gold / yellow
  "&7": "\x1b[37m", // gray
  "&8": "\x1b[90m", // dark gray
  "&9": "\x1b[94m", // blue

  "&a": "\x1b[92m", // green
  "&b": "\x1b[96m", // aqua / light cyan
  "&c": "\x1b[91m", // red
  "&d": "\x1b[95m", // light purple
  "&e": "\x1b[93m", // yellow
  "&f": "\x1b[97m", // white

  // Background
  "&B0": "\x1b[40m", // black
  "&B1": "\x1b[44m", // dark blue
  "&B2": "\x1b[42m", // dark green
  "&B3": "\x1b[46m", // dark aqua / cyan
  "&B4": "\x1b[41m", // dark red
  "&B5": "\x1b[45m", // purple
  "&B6": "\x1b[43m", // gold / yellow
  "&B7": "\x1b[47m", // gray
  "&B8": "\x1b[100m", // dark gray
  "&B9": "\x1b[104m", // blue

  "&Ba": "\x1b[102m", // green
  "&Bb": "\x1b[106m", // aqua / light cyan
  "&Bc": "\x1b[101m", // red
  "&Bd": "\x1b[105m", // light purple
  "&Be": "\x1b[103m", // yellow
  "&Bf": "\x1b[107m", // white
};

export const colourise = (text: string): string => {
  for (const [code, colour] of Object.entries(consoleColours)) {
    text = text.replace(
      new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      colour,
    );
  }
  return text;
};

export const hexToRgb = (hex: string): RGB => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

export const interpolateColor = (start: RGB, end: RGB, factor: number): RGB => {
  return [
    Math.round(start[0] + factor * (end[0] - start[0])),
    Math.round(start[1] + factor * (end[1] - start[1])),
    Math.round(start[2] + factor * (end[2] - start[2])),
  ];
};

export const gradientise = (
  text: string,
  startHex: string,
  endHex: string,
  opts?: { background?: boolean },
): string => {
  const startRGB = hexToRgb(startHex);
  const endRGB = hexToRgb(endHex);
  const chars = text.split("");
  const isBg = opts?.background ?? false;

  return (
    chars
      .map((char, i) => {
        const factor = i / Math.max(chars.length - 1, 1);
        const [r, g, b] = interpolateColor(startRGB, endRGB, factor);
        const code = `\x1b[${isBg ? "48" : "38"};2;${r};${g};${b}m`;
        return `${code}${char}`;
      })
      .join("") + "\x1b[0m"
  );
};
