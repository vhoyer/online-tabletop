import deepmerge from 'deepmerge'

const configProxy = (obj) => new Proxy(obj, {
  get(target, key, _proxy) {
    const custom = {
      value: () => target[key] ?? target.default,
      editableValue: () => target[key] ?? target.default.join('\n'),
    }

    console.warn('[debug][proxy][get]', {target, key, _proxy})

    return custom[key]?.() ?? target[key]
  },
  set(target, key, value, _proxy) {
    const custom = {
      editableValue: () => {
        target.value = value.split('\n')
        target.editableValue = value
      },
    }

    custom[key]?.() ?? (target[key] = value)
  },
})

export function Game(props = {}) {
  Object.assign(this, deepmerge({
    version: 1,
    name: null,
    config: null,
    create: [],
    setup: [],
  }, props))

  this.config = Object.fromEntries(
    Object.entries(this.config)
      .map(([key, value]) => [key, configProxy(value)]),
  )

  console.log('[debug][game]', this)
}
