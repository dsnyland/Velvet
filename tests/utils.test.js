const assert = require("assert");

/**
 * Runs a series of console log–based tests.
 *
 * This function overrides `console.log` temporarily and captures its output
 * while executing a set of functions. For each function provided, it checks
 * that the captured console output matches the expected string.
 *
 * @param {Object<string, Function>} object
 *   An object where:
 *   - Each **key** is the expected string that should be logged.
 *   - Each **value** is a function that, when executed, should call `console.log`
 *     with that string.
 *
 * @example
 * const { check_console_logs } = require("./utils.test.js");
 *
 * check_console_logs({
 *   "! Test function!": () => console.log("! Test function!"),
 *   "⚠️ Warning!": () => console.log("⚠️ Warning!"),
 * });
 *
 * // Output:
 * // ✅ test number 1 passed
 * // ✅ test number 2 passed
 */

function check_console_logs(object) {
  let output = "";
  const originalLog = console.log;
  console.log = (msg) => {
    output += msg;
  };

  Object.entries(object).forEach(([key, value], idx) => {
    value();

    try {
      assert.strictEqual(output, key);
      console.info(`✅ test number ${idx + 1} passed`);
    } catch (err) {
      console.error(`❌ test number ${idx + 1} failed`);
      process.exit(1);
    }

    output = "";
  });

  console.log = originalLog;
}

module.exports = { check_console_logs };
