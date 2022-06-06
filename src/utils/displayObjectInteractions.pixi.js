import { xyAdd, xyNeg, xyIncrement } from '@utils/coordinates';

export const movable = (displayObject) => {
  displayObject.tabletop_pointerList = {};

  displayObject.addEventListener('pointerdown', (e) => {
    displayObject.tabletop_pointerList[e.data.pointerId] = {
      id: e.data.pointerId,
      downAt: e.data.global.clone(),
      isDragging: true,
    };
  });
  displayObject.addEventListener('pointermove', (e) => {
    const pointer = displayObject.tabletop_pointerList[e.data.pointerId];
    if (!pointer) return; // if no pointer exists, it's just hovering

    Object.assign(pointer, {
      lastAt: pointer.moveAt ?? pointer.downAt,
      moveAt: e.data.global.clone(),
    });

    if (!pointer.isDragging) return;

    const { lastAt, moveAt } = pointer;
    const moveDiff = xyAdd(xyNeg(lastAt), moveAt);
    xyIncrement(displayObject, moveDiff);
  });
  displayObject.addEventListener('pointerup', (e) => {
    displayObject.tabletop_pointerList[e.data.pointerId] = {
      isDragging: false,
    };
  });
};
