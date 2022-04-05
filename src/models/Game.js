import deepmerge from 'deepmerge'

export function Game(props = {}) {
  Object.assign(this, deepmerge({
    version: 1,
    name: null,
    config: null,
    create: [],
    setup: [],
  }, props))
}

