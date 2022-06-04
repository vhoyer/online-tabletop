export function onUpdateWrapRaw({ onUpdate }, fn) {
  if (!onUpdate) {
    return (...args) => fn(...args);
  }

  return (...args) => {
    const old = this.toPlainObject();

    const returnValue = fn(...args);

    onUpdate(this, old);

    return returnValue;
  };
}
