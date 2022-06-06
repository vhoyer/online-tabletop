export const isSelf = (e) => {
  return e.currentTarget === e.target;
};

export const onlySelf = fn => (...args) => {
  const [e] = args;

  if (!isSelf(e)) return;

  fn(...args);
};
