export const getCallerInfo = () => {
  const err = new Error();
  const stack = err.stack?.split("\n") ?? [];

  const caller = stack[3] || "";
  const callerInfo = caller.match(/\((.*):(\d+):\d+\)/);

  const [, file, line] = callerInfo ?? [];

  return callerInfo
    ? `${file}:${line}`
    : "<unknown caller... samsung smart fridge!?>";
};
