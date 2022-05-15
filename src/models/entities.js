import deepmerge from 'deepmerge'
import DOMPurify from 'dompurify'

export const base = {
  createObject(_props) {
    // every entity that can be defined as a template must have this function
    // declared returning itself with data change
  },
  addObject(_childObject) {
    // every entity that can be a container must have this function declared
  },
}

export function Card(props = {}) {
  Object.assign(this, deepmerge({
    template: '',
    data: {},
  }, props))

  this.rendered = DOMPurify.sanitize(
    this.template.join('').replace(/\$\{\w+\}/g, (match) => {
      return this.data[match.substring(2, match.length - 1)]
    })
  )

  this.createObject = (props) => {
    return new Card({
      ...this,
      data: props,
    })
  }
}

export function Deck(props = {}) {
  Object.assign(this, deepmerge({
    stack: [],
  }, props))

  this.addObject = (card) => {
    if (!(card instanceof Card)) throw new Error('The only object Deck accepts as child are Card instances')

    this.stack.push(card)
  }

  this.merge = (deck) => {
    this.stack.push(...deck.stack)
  }
}

export function Pile(props = {}) {
  Object.assign(this, deepmerge({
    pos: '0crd 0crd',
    spread: 'no',
    deck: undefined,
  }, props))

  this.deck = new Deck(this.deck)

  this.addObject = (child) => {
    if (child instanceof Card) {
      this.deck.addObject(child)
    } else if (child instanceof Deck) {
      this.deck.merge(child)
    } else {
      throw new Error(`unsupported type of child in Pile`)
    }
  }
}
