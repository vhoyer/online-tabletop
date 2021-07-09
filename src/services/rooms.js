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
  return database.ref('rooms').push(room.toDatabase())
}
