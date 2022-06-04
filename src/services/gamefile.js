import { get, executeOnEntries } from '@utils/object';
import { TypeDictionary } from '@models/entities';

const regexVariableSubstitute = /\$\{[\w.]+\}/g; // ${variable.name}
const regexNumberRange = /^\d+\.\.\d+$/; // 1..10

const dynamicString = (value, state) => {
  const typeofValue = typeof value;
  if (typeofValue !== 'string') throw new Error(`value (${typeofValue}) is not string: ${JSON.stringify(value)}`);

  return value.replace(regexVariableSubstitute, (match) => {
    return get(state, match.substring(2, match.length - 1));
  });
};

const statementToParts = ({ state, cursor }, statement) => {
  return statement.split(/\s+/g).map((partRaw) => {
    const part = dynamicString(partRaw, state);

    if ('@next' === part) {
      const [_index, nextItem] = cursor.next().value;
      return nextItem;
    }

    if (regexNumberRange.test(part)) {
      const [min, max] = part.split('..').map(i => Number(i));
      const length = max - min + 1;
      return Array(length).fill(min).map((v, i) => v + i);
    }

    if (part.startsWith('$')) {
      return get(state, part.substring(1)) ?? part;
    }

    return part;
  });
};

const dynamicLiteral = (value, env) => {
  const hint = '$=>';

  // already literal, return
  if (typeof value !== 'string') return value;
  // escape $$ sign as a single $
  if (!value.startsWith(hint)) return value.replace(/\$\$/g, '$');

  return executeOne(env, statementToParts(env, value.substring(hint.length)));
};

const define = ({ memory }, abstractType, name, type, value) => {
  const abstractTypeMap = {
    'template': 'templates',
    'object': 'objects',
  };

  const abstract = abstractTypeMap[abstractType];

  if (abstract === undefined) throw new Error(`Invalid abstractType "${abstractType}"`);
  if (memory[abstract][name]) throw new Error(`${abstractType} with name "${name}" already defined`);

  const fallbackType = function(i) {
    return i;
  };
  const Type = TypeDictionary[type] ?? fallbackType;

  memory[abstract][name] = {
    type,
    value: new Type(value),
  };
};

const for_in = ({ memory, state }, name, collection, block) => {
  if (typeof block.entries !== 'function') throw new Error('invalid block type, must be iterable');
  if (!Array.isArray(collection)) throw new Error('invalid collection type, must be array');

  collection.forEach((item) => {
    const newLocalState = { ...state, [name]: item };

    execute(memory, block.entries(), newLocalState);
  }, {});
};

const add_to = (env, containerName, type, ...rest) => {
  const { memory, state } = env;

  const typeOfAddition = {
    'template': (templateName, props) => {
      const materializedProps = executeOnEntries(props, [
        entries => entries.map(([k, v]) => [k, dynamicString(v, state)]),
        entries => entries.map(([k, v]) => [k, dynamicLiteral(v, env)]),
      ]);

      const template = memory.templates[templateName];

      if (!template) throw new Error(`No template with name "${templateName}"`);
      if (typeof template.value.createObject !== 'function') throw new Error(`Template "${templateName}"(type:${template.type}) does not implement createObject()`);

      return template.value.createObject(materializedProps);
    },
    'object': (objectName) => {
      const object = memory.objects[objectName];
      delete memory.objects[objectName];
      return object.value;
    },
  };

  const addition = typeOfAddition[type]?.(...rest);

  if (addition === undefined) throw new Error(`Invalid addition type "${type}"`);

  const container = memory.objects[containerName];

  if (!container) throw new Error(`Container object "${containerName}" does not exist`);
  if (typeof container.value.addObject !== 'function') throw new Error(`Object "${containerName}"(type:${container.type}) does not accept child objects`);

  container.value.addObject(addition);
};

const eq = (left, right) => {
  return left === right;
};

const object = ({ memory }, name, actionName, parameters) => {
  const obj = memory.objects[name];

  if (!obj) throw new Error(`Object "${name}" does not exist`);
  const action = obj.value[actionName];
  if (typeof action !== 'function') throw new Error(`Object "${name}" does not have "${actionName}" action`);

  action(parameters);
};

const commandList = {
  define,
  for_in,
  add_to,
  eq,
  object,
};

const executeOne = (env, [commandName, ...parts]) => {
  const command = commandList[commandName];

  if (typeof command !== 'function') throw new Error(`Unknown command "${commandName}"`);

  return command(env, ...parts);
};

export const execute = (memory, cursor, state, annotation = '') => {
  console.groupCollapsed('[debug][execute]: block');
  for (const [index, statement] of cursor) {
    if (typeof statement !== 'string') continue;

    const env = { memory, state, cursor };

    const partList = statementToParts(env, statement);

    console.info('[debug][execute]:', partList);
    try {
      executeOne(env, partList);
    } catch (err) {
      console.groupEnd();
      console.error(`[error][execute(${annotation})][index(${index})]:`, partList, err);
      throw err;
    }
  }
  console.groupEnd();

  return memory;
};
