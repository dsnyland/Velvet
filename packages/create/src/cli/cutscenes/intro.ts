import readline from "readline";
import { colourise, gradientise } from "@velvet/utils";
import { clearTerminalLines, typewriterTerminal } from "../utils/terminal";

const intro = async () =>
  new Promise(async (resolve) => {
    const introTitleScreen = [
      {
        title: "🍰 " + gradientise("Velvet Bakery", "#e4a055", "#ce4a77", {}),
        duration: 1,
      },
      {
        title: gradientise(
          "Let's make your next web project even more awesome!",
          "#beb1b1",
          "#beb1b1",
          {},
        ),
        duration: 1.5,
      },
    ];

    console.log("\n".repeat(introTitleScreen.length));

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const controller = new AbortController();
    const signal = controller.signal;

    const handleKey = (_: string, key: { name: string }) => {
      if (key.name === "return") {
        cleanup();
        controller.abort();
        clearTerminalLines(4 + introTitleScreen.length);
        resolve(true);
      }
    };

    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener("keypress", handleKey);
    };

    process.stdin.on("keypress", handleKey);

    await Promise.all(
      introTitleScreen.map((info, index) =>
        typewriterTerminal(
          info.title,
          info.duration,
          introTitleScreen.length - index,
          signal,
        ),
      ),
    );

    if (signal?.aborted) return resolve(true);

    console.log("\n");
    console.log(colourise("&lPress ENTER to start&r"));
    console.log(
      gradientise(
        "(c) dsny.land, all rights reserved",
        "#867474",
        "#867474",
        {},
      ),
    );
  });

export default intro;
