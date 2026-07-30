type ParameterVal = string | number | boolean | null | undefined;

export const buildQueryParams = (
  parameters: Record<string, ParameterVal>,
): string => {
  if (Object.entries(parameters).length == 0) {
    return "";
  }
  let res: string = "?";
  Object.entries(parameters).forEach(
    ([key, value]: [string, ParameterVal], i: number) => {
      res += (i > 0 ? "&" : "") + key + "=" + String(value);
    },
  );
  return res;
};
