export const setParams = <T extends ParamsObject>(params: T): URLSearchParams => {
  const newParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          newParams.append(key, item.toString());
        }
      });
    } else {
      newParams.append(key, value.toString());
    }
  }

  return newParams;
};

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
