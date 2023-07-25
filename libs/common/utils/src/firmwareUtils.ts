export const compareVersions = (a?: string, b?: string): number => {
  const v1 = (a || '').split('.')
  const v2 = (b || '').split('.')
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    const res = Number(v1[i]) - Number(v2[i])
    if (res !== 0) {
      return res
    }
  }
  return 0
}
