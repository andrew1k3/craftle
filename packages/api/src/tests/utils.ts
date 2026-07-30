export const buildQueryParams = (parameters: Record<string, any>): string => {
  if (Object.entries(parameters).length == 0) {
    return "";
  }
  let res: string = "?";
  Object.entries(parameters).forEach(
    ([key, value]: [string, any], i: number) => {
      res += (i > 0 ? "&" : "") + key + "=" + String(value);
    },
  );
  return res;
};
