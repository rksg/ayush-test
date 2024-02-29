

export const byteCounter = (str: string): number => {
  if (str) {
    let m = encodeURIComponent(str).match(/%[89ABab]/g)
    return str.length + (m ? m.length : 0)
  }
  return 0
}