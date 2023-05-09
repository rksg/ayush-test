export const isValidColorHex = function (colorHex: string) {
  return /^#(?:[0-9a-fA-F]{2}){3,4}$/.test(colorHex)
}