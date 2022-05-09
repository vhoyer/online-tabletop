import deepmerge from 'deepmerge'
import { mapValues } from '@utils/object'

const configProxy = (obj, callback) => new Proxy(obj, {
  get(target, key, _proxy) {
    const custom = {
      value: () => target[key] ?? target.default,
      editableValue: () => target[key] ?? target.default.join('\n'),
    }

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
    callback()
    return true
  },
})

export function Game(props = {}, { onUpdate } = {}) {
  Object.assign(this, deepmerge({
    version: 1,
    name: null,
    config: null,
    create: [],
    setup: [],
  }, props))

  let old;
  const updateNotifier = () => {
    onUpdate(this, old)
    old = this.toPlainObject();
  }

  this.config = mapValues(this.config, value => configProxy(value, updateNotifier))

  console.log('[debug][game]', this)

  this.copy = () => {
    return new Game(this.toPlainObject())
  }

  this.toPlainObject = () => {
    return JSON.parse(JSON.stringify(this))
  }

  old = this.toPlainObject();
}
