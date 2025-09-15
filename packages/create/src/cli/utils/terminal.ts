export const clearTerminalLines = (lines: number) => {
  process.stdout.write(`\x1b[${lines}A`);

  for (const _ of Array.from({ length: lines })) {
    process.stdout.write("\x1b[2K");
    process.stdout.write("\x1b[1B");
  }

  process.stdout.write(`\x1b[${lines}A`);
};
