import firebase from 'firebase/app'
import 'firebase/database'

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

export function roomSubscribe(id, currentUser, callback) {
  const roomRef = database.ref(`rooms/${id}`)

  let disconnectInstruction = null

  const onValueChange = (snapshot) => {
    if (!snapshot.exists()) throw new Error('room inexistent')

    disconnectInstruction?.cancel()

    const room = snapshot.val()

    if (Object.keys(room.users).length > 1) {
      disconnectInstruction = snapshot.child('users').ref.onDisconnect()
      const myself = room.users[currentUser]

      const usersWithoutMe = Object.entries(room.users).filter(([name]) => name !== currentUser)

      if (myself.type === 'host') {
        usersWithoutMe.sort((a, b) => new Date(a.enteredAt) - new Date(b.enteredAt))
        usersWithoutMe[0].type = 'host'
      }

      disconnectInstruction.set(Object.fromEntries(usersWithoutMe))
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
