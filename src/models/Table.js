import { mapValues } from '@utils/object';
import { execute } from '@services/gamefile';
import { TypeDictionary } from '@models/entities';
import deepmerge from 'deepmerge';

export function Table(props = {}, { onUpdate } = {}) {
  Object.assign(this, deepmerge({
    templates: {},
    objects: {},
  }, props));

  const rehydrateChildren = () => {
    const rehydrateTargets = ['templates', 'objects'];

    const rehydrateChild = (container) => {
      Object.keys(container).forEach((key) => {
        const Klass = TypeDictionary[container[key].type];
        container[key].value = new Klass(container[key].value);
      });
    };

    rehydrateTargets.forEach((key) => {
      rehydrateChild(this[key]);
    });
  };

  rehydrateChildren();

  const onUpdateWrap = (fn) => {
    if (!onUpdate) return fn;

    return (...args) => {
      const old = this.toPlainObject();

      const returnValue = fn(...args);

      onUpdate(this, old);

      return returnValue;
    };
  };

  this.createTable = onUpdateWrap((game) => {
    this.templates = {};
    this.objects = {};

    const variables = mapValues(game.config, i => i.value);
    const cursorCreate = game.create.entries();

    execute(this, cursorCreate, variables, 'create');
  });

  this.setupTable = onUpdateWrap((game) => {
    const variables = mapValues(game.config, i => i.value);

    execute(this, game.setup.entries(), variables, 'setup');
  });

  this.copy = () => {
    return new Table(this.toPlainObject());
  };

  this.toPlainObject = () => {
    return JSON.parse(JSON.stringify(this));
  };
}
