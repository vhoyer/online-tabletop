import deepmerge from 'deepmerge'

export function Room(props = {}) {
	Object.assign(this, deepmerge({
		users: {},
		game: null,
	}, props))

	this.addUser = (username) => {
		if (!username) throw new Error("User can't have empty username")
		if (this.users[username]) throw new Error('User already exists in the room')

		const type = Object.keys(this.users).length > 0 ? 'spectator' : 'host'

		this.users[username] = {
			type,
			createdAt: new Date(),
		}
	}
}
