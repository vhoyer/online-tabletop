import { Room } from '@models/Room'

describe('Models > Room', () => {
	def('subject', () => new Room($.base))

	it('initiates as a empty room', () => {
		expect($.subject).toEqual({
			addUser: expect.any(Function),
			users: {},
			game: null,
		})
	})

	describe('when call addUser with "" (Empty string)', () => {
		it('initiates as a empty room', () => {
			expect(() => {
				$.subject.addUser('')
			}).toThrow(new Error("User can't have empty username"))
		})
	})

	describe('when call addUser with "o_mago"', () => {
		beforeEach(() => {
			$.subject.addUser('o_mago')
		})

		it('add first user as host', () => {
			expect($.subject).toEqual({
				addUser: expect.any(Function),
				users: {
					'o_mago': {
						createdAt: expect.any(Date),
						type: 'host',
					},
				},
				game: null,
			})
		})

		describe('when call addUser with "bolinha_gamer"', () => {
			beforeEach(() => {
				$.subject.addUser('bolinha_gamer')
			})

			it('Add new user as spectator', () => {
				expect($.subject).toEqual({
					addUser: expect.any(Function),
					users: {
						'o_mago': {
							createdAt: expect.any(Date),
							type: 'host',
						},
						'bolinha_gamer': {
							createdAt: expect.any(Date),
							type: 'spectator',
						},
					},
					game: null,
				})
			})
		})

		describe('when call addUser with "o_mago"', () => {
			it('initiates as a empty room', () => {
				expect(() => {
					$.subject.addUser('o_mago')
				}).toThrow(new Error('User already exists in the room'))
			})
		})
	})
})
