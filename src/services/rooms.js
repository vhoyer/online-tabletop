import { database } from './vendor/firebase';
import { Room } from '@models/Room';
import { observableDiff } from 'deep-diff';

/**
 * @param {Room} room from @models/Room
 */
export function roomCreate(room) {
  return database.ref('rooms').push(room.toPlainObject());
}

export function roomSubscribe(id, currentUser, callback, onError = () => {}) {
  const roomRef = database.ref(`rooms/${id}`);

  let disconnectInstruction = null;

  const onValueChange = (snapshot) => {
    if (!snapshot.exists()) return onError(new Error('room inexistent'));

    disconnectInstruction?.cancel();

    const roomRaw = snapshot.val();
    console.info('[APP][database] incoming change', roomRaw);

    const room = new Room(roomRaw, {
      onUpdate(newValue, old) {
        const newValuePlain = newValue.toPlainObject();

        observableDiff(old, newValuePlain, diff => ({
          'N': () => { // indicates a newly added property/element
            const key = diff.path.join('/');

            console.info(`[APP][database] New "${key}", set:`, diff.rhs);
            snapshot.child(key).ref.set(diff.rhs);
          },
          'E': () => { // indicates a property/element was edited
            const key = diff.path.join('/');

            console.info(`[APP][database] Edit "${key}", set:`, diff.rhs);
            snapshot.child(key).ref.set(diff.rhs);
          },
          // 'D': () => {}, // indicates a property/element was deleted
          'A': () => { // indicates a change occurred within an array
            const newArray = diff.path.reduce((value, next) => value[next], newValuePlain);
            const key = diff.path.join('/');

            console.info(`[APP][database] Override array "${key}", with:`, newArray);
            snapshot.child(key).ref.set(newArray);
          },
        })[diff.kind]?.());
      },
    });

    if (Object.keys(room.users).length > 1) {
      disconnectInstruction = snapshot.child('users').ref.onDisconnect();
      const newRoom = room.copy().userRemove(currentUser);
      disconnectInstruction.set(newRoom.toPlainObject().users);
    } else {
      disconnectInstruction = snapshot.ref.onDisconnect();
      disconnectInstruction.remove();
    }

    callback(room);
  };

  roomRef.on('value', onValueChange);

  const unsubscribe = () => {
    roomRef.off('value', onValueChange);
  };

  return unsubscribe;
}
