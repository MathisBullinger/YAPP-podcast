export const translateKeys = (obj: object, map: { [key: string]: string }) =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => k in map)
      .map(([k, v]) => [map[k], v])
  )
