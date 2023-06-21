/**
 * Compare minimum and version and return true if version >= minimum
 */
export function meetVersionRequirements (minimum: string, version: string): boolean {
  if (minimum === null) return true
  if (minimum === undefined) return false
  if (!version) return false
  return compareVersion(minimum, version) < 1
}

/**
 * Compare version of `versionA` and `versionA` and returns -1, 0, 1
 */
export function compareVersion (versionA: string, versionB: string): number {
  const a = versionA.split('.').map(part => parseInt(part, 10))
  const b = versionB.split('.').map(part => parseInt(part, 10))

  return compare(a, b)
}


function compare (versionA: number[], versionB: number[]): number {
  const a = versionA.shift()!
  const b = versionB.shift()!

  if (a === b) {
    if (versionA.length + versionB.length === 0) return 0
    return compare(
      versionA.length ? versionA : [0],
      versionB.length ? versionB : [0]
    )
  }

  return a < b ? -1 : 1
}
