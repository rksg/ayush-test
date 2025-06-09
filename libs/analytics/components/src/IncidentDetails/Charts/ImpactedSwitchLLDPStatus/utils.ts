/**
 * Converts a list of ports into a more readable range format
 * Example: ['1/1/1', '1/1/2', '1/1/3', '2/1/1', '2/1/2'] becomes '1/1/1 to 1/1/3, 2/1/1 to 2/1/2'
 *
 * @param ports Array of port strings in the format 'slot/port/interface'
 * @returns A string with port ranges
 */
export function formatPortRanges (ports: string[]): string {
  if (!ports || ports.length === 0) {
    return ''
  }

  // Sort ports by slot, port, and interface numbers
  const sortedPorts = [...ports].sort((a, b) => {
    const [aSlot, aPort, aInterface] = a.split('/').map(Number)
    const [bSlot, bPort, bInterface] = b.split('/').map(Number)
    if (aSlot !== bSlot) return aSlot - bSlot
    if (aPort !== bPort) return aPort - bPort
    return aInterface - bInterface
  })

  // Group ports by slot/port
  const portGroups: Record<string, string[]> = {}

  sortedPorts.forEach(port => {
    const [slot, portNum] = port.split('/')
    const key = `${slot}/${portNum}`

    if (!portGroups[key]) {
      portGroups[key] = []
    }

    portGroups[key].push(port)
  })

  // Convert each group to a range
  const ranges: string[] = []

  Object.keys(portGroups).sort((a, b) => {
    const [aSlot, aPort] = a.split('/').map(Number)
    const [bSlot, bPort] = b.split('/').map(Number)
    if (aSlot !== bSlot) return aSlot - bSlot
    return aPort - bPort
  }).forEach(key => {
    const groupPorts = portGroups[key]
    const interfaces = groupPorts.map(port => {
      const [,, interfaceNum] = port.split('/').map(Number)
      return interfaceNum
    }).sort((a, b) => a - b)

    if (groupPorts.length === 1) {
      // Single port, no range needed
      ranges.push(groupPorts[0])
    } else {
      // Find consecutive ranges
      let start = interfaces[0]
      let prev = start
      const rangeStarts: number[] = []
      const rangeEnds: number[] = []

      for (let i = 1; i < interfaces.length; i++) {
        const current = interfaces[i]
        // Check if this port is consecutive with the previous one
        if (current === prev + 1) {
          prev = current
        } else {
          // End of a range, add it to the result
          rangeStarts.push(start)
          rangeEnds.push(prev)
          start = current
          prev = current
        }
      }
      rangeStarts.push(start)
      rangeEnds.push(prev)

      // Convert ranges back to port strings
      rangeStarts.forEach((start, i) => {
        const end = rangeEnds[i]
        const [slot, port] = key.split('/')
        if (start === end) {
          ranges.push(`${slot}/${port}/${start}`)
        } else {
          ranges.push(`${slot}/${port}/${start} to ${slot}/${port}/${end}`)
        }
      })
    }
  })

  return ranges.join(', ')
}