import { mapValues } from '@utils/object'
import { Deck, Card } from './entities'

export function Table(props = {}, { onUpdate } = {}) {
  const runtime = (cursor, state) => {
    for (let [_index, statement] of cursor) {
      if (typeof statement !== 'string') continue;

      const parts = statement.replace(/ {2,}/g, ' ').split(' ')
        .map(part => {
          if ('@next' === part) {
            const [_index, nextItem] = cursor.next().value
            return nextItem
          }

          if (/^\d+\.\.\d+$/.test(part)) {
            const [min, max] = part.split('..').map(i => Number(i))
            const length = max - min + 1
            return Array(length).fill(min).map((v, i) => v + i)
          }

          if (part.startsWith('$')) {
            return state[part.substring(1)] ?? part
          }

          return part
        })

      console.warn('[debug]', parts)
      const command = parts.shift()

      ;({
        'define': () => {
          const [category, name, type, value] = parts
          const categoryDict = {
            template: (name, object) => {
              this.templates[name] = {
                ...object,
                value: object.value.template.join(''),
              }
            },
            object: (name, { type, value }) => {
              const Type = {
                'deck': Deck,
              }[type] ?? function(i) { return i }

              this.objects[name] = { type, value: new Type(value) }
            },
            pile: (name, { value }) => {
              this.piles[name] = value
            },
          }

          categoryDict[category]?.(
            name,
            { type, value }
          )
        },
        'for_in': () => {
          const [name, collection, commands] = parts

          collection.forEach(item => {
            runtime(commands.entries(), {
              ...state,
              [name]: item,
            })
          })
        },
        'add_to_deck': () => {
          const [deckName, template, substitutions] = parts

          this.objects[deckName].value.addCard(new Card({
            template: this.templates[template].value,
            data: mapValues(substitutions, v => v.replace(/\$\{\w+\}/g, (match) => {
              return state[match.substring(2, match.length - 1)]
            })),
          }))
        },
      })[command]?.()
    }
  }

  this.createTable = (game) => {
    this.templates = {}
    this.objects = {}
    this.piles = {}

    const variables = mapValues(game.config, i => i.value)
    const cursorCreate = game.create.entries()

    runtime(cursorCreate, variables)
  }
}