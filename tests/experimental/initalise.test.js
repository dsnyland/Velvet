const velvet = require("../../dist/index.cjs");
const { check_console_logs } = require("../utils.test.js");

const test_object = {
  "⚠️ Test function!": velvet.initial,
  "⚠️ test function 2!": velvet.initial_function_2,
}

check_console_logs(test_object);
