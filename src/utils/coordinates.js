const xyDivideTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 / x2, y: y1 / y2 });
const xyMultiplyTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 * x2, y: y1 * y2 });
const xyAddTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 + x2, y: y1 + y2 });

export const xyDivide = (...xys) => xys.reduce(xyDivideTwo);
export const xyMultiply = (...xys) => xys.reduce(xyMultiplyTwo);
export const xyAdd = (...xys) => xys.reduce(xyAddTwo);
export const xyNeg = ({ x, y }) => ({ x: -x, y: -y });
export const xySame = (v) => ({ x: v, y: v });
export const xySet = (target, { x, y }) => Object.assign(target, { x, y });
export const xyCenter = ({ width, height }) => ({ x: (width / 2), y: (height / 2) });

export const whtoxy = ({ width, height }) => ({ x: width, y: height });
export const xytowh = ({ x, y }) => ({ width: x, height: y });
