export const isValidColorHex = function (colorHex: string) {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(colorHex) || /^#(?:[0-9a-fA-F]{4}){1,2}$/.test(colorHex)
}