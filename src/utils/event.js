export const onlySelf = (fn) => (...args) => {
  const [e] = args;

  if (e.currentTarget !== e.target) return;

  fn(...args);
}
