import deepmerge from 'deepmerge'

export function Card(props = {}) {
  Object.assign(this, deepmerge({
    template: '',
    data: {},
  }, props))

  this.rendered = this.template.replace(/\$\{\w+\}/g, (match) => {
    return this.data[match.substring(1, match.length - 1)]
  })
}

export function Deck(props = {}) {
  Object.assign(this, deepmerge({
    stack: [],
  }, props))

  this.addCard = (card) => {
    this.stack.push(card)
  }
}
