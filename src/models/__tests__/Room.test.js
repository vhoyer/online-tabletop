import { Room } from '@models/Room'

const utils = {
  userRemove: expect.any(Function),
  userAdd: expect.any(Function),
  toPlainObject: expect.any(Function),
  copy: expect.any(Function),
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

  describe('when call userAdd with "" (Empty string)', () => {
    it('initiates as a empty room', () => {
      expect(() => {
        $.subject.userAdd('')
      }).toThrow(new Error("User can't have empty username"))
    })
  })

  describe('when call userAdd with "o_mago"', () => {
    beforeEach(() => {
      $.subject.userAdd('o_mago')
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

    describe('when call userAdd with "bolinha_gamer"', () => {
      beforeEach(() => {
        $.subject.userAdd('bolinha_gamer')
      })

      it('Add new user as player', () => {
        expect($.subject).toEqual({
          ...utils,
          users: {
            'o_mago': {
              enteredAt: expect.any(Date),
              type: 'host',
            },
            'bolinha_gamer': {
              enteredAt: expect.any(Date),
              type: 'player',
            },
          },
          game: null,
        })
      })

      describe('when call userRemove("o_mago")', () => {
        beforeEach(() => {
          $.subject.userRemove('o_mago')
        })

        it('appoints the oldest user the new host', () => {
          expect($.subject.users).toEqual({
            'bolinha_gamer': {
              enteredAt: expect.any(Date),
              type: 'host',
            },
          })
        })
      })

      describe('when call userRemove("bolinha_gamer")', () => {
        beforeEach(() => {
          $.subject.userRemove('bolinha_gamer')
        })

        it('removes the user', () => {
          expect($.subject.users).toEqual({
            'o_mago': {
              enteredAt: expect.any(Date),
              type: 'host',
            },
          })
        })
      })

      describe('when call copy', () => {
        it('creates a copy of the current Room', () => {
          expect($.subject).toBe($.subject)
          expect($.subject.copy()).not.toBe($.subject)
        })
      })

      describe('when call toPlainObject', () => {
        const regexTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

        def('plainObject', () => $.subject.toPlainObject())

        it('serializes the user correctly', () => {
          expect($.plainObject).toEqual({
            users: {
              'o_mago': {
                enteredAt: expect.stringMatching(regexTimestamp),
                type: 'host',
              },
              'bolinha_gamer': {
                enteredAt: expect.stringMatching(regexTimestamp),
                type: 'player',
              },
            },
            game: null,
          })
        })

        describe('when creating another Room from plain object', () => {
          it('creates Date objects for "enteredAt"', () => {
            expect(new Room($.plainObject)).toEqual({
              ...utils,
              users: {
                'o_mago': {
                  enteredAt: expect.any(Date),
                  type: 'host',
                },
                'bolinha_gamer': {
                  enteredAt: expect.any(Date),
                  type: 'player',
                },
              },
              game: null,
            })
          })
        })
      })
    })

    describe('when call userAdd with "o_mago"', () => {
      it('initiates as a empty room', () => {
        expect(() => {
          $.subject.userAdd('o_mago')
        }).toThrow(new Error('User already exists in the room'))
      })
    })
  })
})
