export const clearTerminalLines = (lines: number) => {
  process.stdout.write(`\x1b[${lines}A`);

  for (const _ of Array.from({ length: lines })) {
    process.stdout.write("\x1b[2K");
    process.stdout.write("\x1b[1B");
  }

  process.stdout.write(`\x1b[${lines}A`);
};

export const writeTerminalLine = (index: number, text: string) => {
  process.stdout.write(`\x1b[${index}A`);
  process.stdout.write("\x1b[2K");
  process.stdout.write(`\r${text}`);
  process.stdout.write(`\x1b[${index}B`);
};

export const typewriterTerminal = async (
  text: string,
  duration: number,
  index: number,
  signal?: AbortSignal,
) => {
  let msg = "";
  const cps = (duration / text.length) * 1000;

  for (const char of text) {
    if (signal?.aborted) break;

    msg += char;
    writeTerminalLine(index, msg);

    await new Promise((resolve) => setTimeout(resolve, cps));
  }
};
