import firebase from 'firebase/app'
import 'firebase/database'
import { Room } from '@models/Room'
import { observableDiff } from 'deep-diff'

firebase.initializeApp({
  apiKey: 'AIzaSyDAjRc0ycZ3RPfjKlYiAyyEP8GkB0fPuco',
  authDomain: 'online-tabletop-4dc50.firebaseapp.com',
  databaseURL: 'https://online-tabletop-4dc50-default-rtdb.firebaseio.com',
  projectId: 'online-tabletop-4dc50',
  storageBucket: 'online-tabletop-4dc50.appspot.com',
  messagingSenderId: '206814685311',
  appId: '1:206814685311:web:6aa4524ee228e8d152f74a',
  measurementId: 'G-4Z52DVNE4E',
})

const database = firebase.database()

/**
 * @param {Room} room from @models/Room
 */
export function roomCreate(room) {
  return database.ref('rooms').push(room.toPlainObject())
}

export function roomSubscribe(id, currentUser, callback, onError = () => {}) {
  const roomRef = database.ref(`rooms/${id}`)

  let disconnectInstruction = null

  const onValueChange = (snapshot) => {
    if (!snapshot.exists()) return onError(new Error('room inexistent'))

    disconnectInstruction?.cancel()

    const roomRaw = snapshot.val()
    const room = new Room(roomRaw, {
      onUpdate(newValue, old) {
        observableDiff(old, newValue.toPlainObject(), diff => ({
          // indicates a newly added property/element
          'N': () => snapshot.child(diff.path.join('/')).ref.set(diff.rhs),
        })?.[diff.kind]())
      },
    })

    if (Object.keys(room.users).length > 1) {
      disconnectInstruction = snapshot.child('users').ref.onDisconnect()
      const newRoom = room.copy().userRemove(currentUser)
      disconnectInstruction.set(newRoom.toPlainObject().users)
    } else {
      disconnectInstruction = snapshot.ref.onDisconnect()
      disconnectInstruction.remove()
    }

    callback(room)
  }

  roomRef.on('value', onValueChange)

  const unsubscribe = () => {
    roomRef.off('value', onValueChange)
  }

  return unsubscribe
}
