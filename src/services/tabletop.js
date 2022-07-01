export const TTMeta = Symbol('TabletopMeta');
export const InitTTMeta = (displayObject) => {
  displayObject[TTMeta] = {};
  return displayObject;
};
