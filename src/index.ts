function parse(str: string): {
  keys: string[];
  pattern: RegExp;
} {
  const keys: string[] = [];

  return {
    keys,
    pattern: new RegExp(
      `${(str[0] === "/" ? str.slice(1) : str)
        .split("/")
        .reduce((pattern, part) => {
          if (part === "*") {
            // biome-ignore lint/style/noParameterAssign: <explanation>
            pattern += "/(?:.*)";
          } else if (part[0] === ":") {
            const optionally = part[part.length - 1] === "?";
            // biome-ignore lint/style/noParameterAssign: <explanation>
            pattern += optionally ? "(?:/([^/]+?))?" : "/([^/]+?)";
            keys.push(
              part.slice(1, optionally ? part.length - 1 : part.length),
            );
          } else {
            // biome-ignore lint/style/noParameterAssign: <explanation>
            pattern += `/${escapeRegExp(part)}`;
          }

          return pattern;
        })}/?$`,
      "i",
    ),
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[\\\*\+\.\?\{\}\(\)\[\]\^\$\-\|\/]/g, "\\$&");
}

export { parse };
