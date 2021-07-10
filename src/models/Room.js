import deepmerge from 'deepmerge'

export function Room(props = {}) {
  Object.assign(this, deepmerge({
    users: {},
    game: null,
  }, props))

  // spawn enteredAt as Date if they are serialized
  this.users = Object.fromEntries(
    Object.entries(this.users)
      .map(([key, data]) => [key, {
        ...data,
        enteredAt: new Date(data.enteredAt),
      }]),
  )

  this.userAdd = (username) => {
    if (!username) throw new Error("User can't have empty username")
    if (this.users[username]) throw new Error('User already exists in the room')

    const type = Object.keys(this.users).length > 0 ? 'spectator' : 'host'

    this.users[username] = {
      type,
      enteredAt: new Date(),
    }
  }

  this.toPlainObject = () => {
    return JSON.parse(JSON.stringify(this))
  }
}
