const xyDivideTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 / x2, y: y1 / y2 });
const xyTimesTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 * x2, y: y1 * y2 });
const xyAddTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: x1 + x2, y: y1 + y2 });
const xyMinTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: Math.min(x1, x2), y: Math.min(y1, y2) });
const xyMaxTwo = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => ({ x: Math.max(x1, x2), y: Math.max(y1, y2) });

export const xyDivide = window.xyDivide = (...xys) => xys.reduce(xyDivideTwo);
export const xyTimes = window.xyTimes = (...xys) => xys.reduce(xyTimesTwo);
export const xyAdd = window.xyAdd = (...xys) => xys.reduce(xyAddTwo);
export const xyMin = window.xyMin = (...xys) => xys.reduce(xyMinTwo);
export const xyMax = window.xyMax = (...xys) => xys.reduce(xyMaxTwo);

export const xyNeg = window.xyNeg = ({ x, y }) => ({ x: -x, y: -y });
export const xySame = window.xySame = v => ({ x: v, y: v });
export const xyCenter = window.xyCenter = ({ width, height }) => ({ x: (width / 2), y: (height / 2) });

export const whtoxy = window.whtoxy = ({ width, height }) => ({ x: width, y: height });
export const xytowh = window.xytowh = ({ x, y }) => ({ width: x, height: y });

export const xySet = window.xySet = (target, { x, y }) => Object.assign(target, { x, y });
export const xyIncrement = window.xyIncrement = (target, ...xys) => xySet(target, xyAdd(target, ...xys));
export const xyMultiply = window.xyMultiply = (target, ...xys) => xySet(target, xyTimes(target, ...xys));

export const xyApply = window.xyApply = (fn, ...xys) => ({ x: fn(...xys.map(p => p.x)), y: fn(...xys.map(p => p.y)) });

export const xyCentroid = window.xyCentroid = (...xys) => xyDivide(xyAdd(...xys), xySame(xys.length));
export const xyDistanceSquared = window.xyDistanceSquared = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
