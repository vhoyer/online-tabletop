import deepmerge from 'deepmerge'
import { mapValues } from '@utils/object'
import { Game } from '@models/Game'
import { Table } from '@models/Table'

export function Room(props = {}, { onUpdate } = {}) {
  Object.assign(this, deepmerge({
    users: {},
    game: null,
    table: null,
  }, props))

  //
  // recreate state from serialized props
  //
  const createChild = (child, Klass) => {
    if (!this[child]) return
    if (this[child] instanceof Klass) return

    this[child] = new Klass(this[child], {
      onUpdate: (_current, oldChild) => {
        const old = this.toPlainObject()
        old[child] = oldChild;

        onUpdate(this, old);
      },
    })
  }
  const recreateState = () => {
    this.users = mapValues(this.users, data => ({
      ...data,
      enteredAt: new Date(data.enteredAt)
    }))

    const childModels = [
      ['game', Game],
      ['table', Table],
    ]

    childModels.forEach(([child, Klass]) => {
      createChild(child, Klass)
    })
  }
  recreateState()

  //
  // Private methods
  //

  const onUpdateWrap = (fn) => {
    const fnWith = (extra, ...args) => {
      const returnValue = fn(...args)
      extra()
      return returnValue
    }

    if (!onUpdate) {
      return (...args) => fnWith(recreateState, ...args)
    }

    return (...args) => {
      const old = this.toPlainObject()

      return fnWith(() => onUpdate(this, old), ...args)
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
    this.game = game
    createChild('game', Game)
    return this
  })

  this.tableCreate = onUpdateWrap(() => {
    this.table = this.table ?? {}
    createChild('table', Table)
    this.table.createTable(this.game)
    return this
  })

  this.tableSetup = onUpdateWrap(() => {
    this.table = this.table ?? {}
    createChild('table', Table)
    this.table.setupTable(this.game)
    return this
  })

  this.copy = () => {
    return new Room(this.toPlainObject())
  }

  this.toPlainObject = () => {
    return JSON.parse(JSON.stringify(this))
  }
}
