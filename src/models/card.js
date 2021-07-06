export const cardType = ({
  style = '',
  template = '',
  back = '',
} = {}) => {
  return new Proxy({ style, template, back }, {
    get(target, key) {
      const addons = {
        render(data) {
          return template.replace(/\{\w+\}/, (match) => {
            return data[match.substr(1, match.length - 2)];
          })
        },
      };

      if (addons[key]) return addons[key];

      return target[key];
    },
  });
}
