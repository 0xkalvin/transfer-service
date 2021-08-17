function toSnakeCase(key) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function objectToSnakeCase(object = {}) {
  const newObject = {};

  Object.keys(object).forEach((key) => {
    const parsedKey = toSnakeCase(key);

    newObject[parsedKey] = object[key];
  });

  return newObject;
}

module.exports = {
  objectToSnakeCase,
  toSnakeCase,
};
