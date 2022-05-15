import { mapValues } from '@utils/object'
import { execute } from '@services/gamefile'

export function Table(props = {}, { onUpdate } = {}) {
  this.createTable = (game) => {
    this.templates = {}
    this.objects = {}

    const variables = mapValues(game.config, i => i.value)
    const cursorCreate = game.create.entries()

    execute(this, cursorCreate, variables, 'create')

    return this
  }

  this.setupTable = (game) => {
    const variables = mapValues(game.config, i => i.value)

    execute(this, game.setup.entries(), variables, 'setup')

    return this
  }
}
