import deepmerge from 'deepmerge'
import { mapValues } from '@utils/object'
import { Game } from '@models/Game'

export function Room(props = {}, { onUpdate } = {}) {
  Object.assign(this, deepmerge({
    users: {},
    game: null,
  }, props))

  //
  // recreate state from serialized props
  //
  this.users = mapValues(this.users, data => ({
    ...data,
    enteredAt: new Date(data.enteredAt)
  }))
  if (this.game) {
    this.game = new Game(this.game)
  }

  //
  // Private methods
  //

  const onUpdateWrap = (fn) => {
    if (!onUpdate) {
      return (...args) => fn(...args)
    }

    return (...args) => {
      const old = this.toPlainObject()

      const returnValue = fn(...args)

      onUpdate(this, old)

      return returnValue
    }
  }

  //
  // Public Methods
  //

  this.userAdd = onUpdateWrap((username) => {
    if (!username) throw new Error("User can't have empty username")
    if (this.users[username]) throw new Error('User already exists in the room')

    const type = Object.keys(this.users).length > 0 ? 'player' : 'host'

    this.users[username] = {
      type,
      enteredAt: new Date(),
    }

    return this
  })

  this.userRemove = onUpdateWrap((username) => {
    const { [username]: toBeRemoved, ...users } = this.users

    if (toBeRemoved.type === 'host') {
      const oldestToNewest = (a, b) => a.enteredAt - b.enteredAt
      const [oldestUser] = Object.entries(users).sort(oldestToNewest)[0]
      users[oldestUser].type = 'host'
    }

    Object.assign(this, { users })

    return this
  })

  this.gameSet = onUpdateWrap((game) => {
    Object.assign(this, { game })

    return this
  })

  this.copy = () => {
    return new Room(this.toPlainObject())
  }

  this.toPlainObject = () => {
    return JSON.parse(JSON.stringify(this))
  }
}
