import { Room } from '@models/Room'

const utils = {
  addUser: expect.any(Function),
  toPlainObject: expect.any(Function),
}

describe('Models > Room', () => {
  def('subject', () => new Room($.base))

  it('initiates as a empty room', () => {
    expect($.subject).toEqual({
      ...utils,
      users: {},
      game: null,
    })
  })

  describe('when call toPlainObject', () => {
    it('removes all functions', () => {
      expect($.subject.toPlainObject()).toEqual({
        users: {},
        game: null,
      })
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
        ...utils,
        users: {
          'o_mago': {
            enteredAt: expect.any(Date),
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
          ...utils,
          users: {
            'o_mago': {
              enteredAt: expect.any(Date),
              type: 'host',
            },
            'bolinha_gamer': {
              enteredAt: expect.any(Date),
              type: 'spectator',
            },
          },
          game: null,
        })
      })

      describe('when call toPlainObject', () => {
        const regexTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

        it('serializes the user correctly', () => {
          expect($.subject.toPlainObject()).toEqual({
            users: {
              'o_mago': {
                enteredAt: expect.stringMatching(regexTimestamp),
                type: 'host',
              },
              'bolinha_gamer': {
                enteredAt: expect.stringMatching(regexTimestamp),
                type: 'spectator',
              },
            },
            game: null,
          })
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
