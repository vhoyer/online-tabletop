import { mapValues, get } from '@utils/object'
import { Deck, Card } from './entities'

export function Table(props = {}, { onUpdate } = {}) {
  const dynamicString = (value, state) => {
    return value.replace(/\$\{[\w.]+\}/g, (match) => {
      return get(state, match.substring(2, match.length - 1))
    })
  }

  const runtime = (cursor, state = {}) => {
    console.groupCollapsed('runtime block')
    for (let [_index, statement] of cursor) {
      if (typeof statement !== 'string') continue;

      const parts = statement.replace(/ {2,}/g, ' ').split(' ')
        .map(partRaw => {
          const part = dynamicString(partRaw, state)

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
            return get(state, part.substring(1)) ?? part
          }

          return part
        })

      console.info('[debug][statement]', parts)
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
        'add_to': () => {
          const [container, type, ...rest] = parts

          ;({
            'template': (template, substitutions) => {
              this.objects[container].value.addCard(new Card({
                template: this.templates[template].value,
                data: mapValues(substitutions, v => dynamicString(v, state)),
              }))
            },
            'object': (entity) => {
              this.objects[container]?.addObject?.(this.objects[entity])
            },
          })[type]?.(...rest)
        },
      })[command]?.()
    }
    console.groupEnd()
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
