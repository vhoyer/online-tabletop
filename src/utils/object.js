export const mapEntries = (object, transformer) => {
  if (!Boolean(object)) return undefined;

  return Object.fromEntries(
    Object.entries(object)
      .map(transformer)
  )
}

export const mapValues = (object, transformer) => {
  return mapEntries(object, ([key, value]) => [key, transformer(value)])
}
