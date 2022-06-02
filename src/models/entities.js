import deepmerge from 'deepmerge'
import { shuffle } from '@utils/array'
import { mapValues } from '@utils/object'

const forwardActions = (self, entity, actionList) => {
  actionList.forEach(action => {
    self[action] = (...args) => entity[action](...args)
  })
}

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
    props: {},
    data: {},
  }, props));

  this.props = mapValues(this.props, (v) => v.replace(
    /\$\{\w+\}/g,
    (match) => this.data[match.substring(2, match.length - 1)],
  ));

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

  this.shuffle = () => {
    this.stack = shuffle(this.stack)
  }

  this.draw = ({ target, flip = true }) => {
  }
}

export function Pile(props = {}) {
  Object.assign(this, deepmerge({
    pos: '0crd 0crd',
    spread: 'no',
    deck: undefined,
  }, props))

  this.deck = new Deck(this.deck)

  forwardActions(this, this.deck, [
    'draw',
    'shuffle',
  ])

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

export const TypeDictionary = {
  'card': Card,
  'deck': Deck,
  'pile': Pile,
}
