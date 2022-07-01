import { xyAdd, xyNeg, xyIncrement, xyTimes, xyInvert } from '@utils/coordinates';
import { TTMeta } from '@services/tabletop';

export const movable = (displayObject) => {
  displayObject.addEventListener('added', () => {
    displayObject[TTMeta].pointerList = {};
  });

  displayObject.addEventListener('pointerdown', (e) => {
    displayObject[TTMeta].pointerList[e.data.pointerId] = {
      id: e.data.pointerId,
      downAt: e.data.global.clone(),
      isDragging: true,
    };
  });
  displayObject.addEventListener('pointermove', (e) => {
    const pointer = displayObject[TTMeta].pointerList[e.data.pointerId];
    if (!pointer) return; // if no pointer exists, it's just hovering

    Object.assign(pointer, {
      lastAt: pointer.moveAt ?? pointer.downAt,
      moveAt: e.data.global.clone(),
    });

    if (!pointer.isDragging) return;

    const { lastAt, moveAt } = pointer;
    const moveDiff = xyAdd(xyNeg(lastAt), moveAt);
    const moveDiffScaled = xyTimes(moveDiff, xyInvert(displayObject[TTMeta].global.scale));
    xyIncrement(displayObject, moveDiffScaled);
  });
  displayObject.addEventListener('pointerup', (e) => {
    displayObject[TTMeta].pointerList[e.data.pointerId] = {
      isDragging: false,
    };
  });
};
