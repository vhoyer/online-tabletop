import { mapValues } from '@utils/object'
import { execute } from '@services/gamefile'

export function Table(props = {}, { onUpdate } = {}) {
  this.createTable = (game) => {
    this.templates = {}
    this.objects = {}

    const variables = mapValues(game.config, i => i.value)
    const cursorCreate = game.create.entries()

    execute(this, cursorCreate, variables, 'create')
  }
}
