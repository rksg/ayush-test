import { formatPortRanges } from './utils'

describe('formatPortRanges', () => {
  it('should return an empty string for empty input', () => {
    expect(formatPortRanges([])).toBe('')
    expect(formatPortRanges(undefined as unknown as string[])).toBe('')
    expect(formatPortRanges(null as unknown as string[])).toBe('')
  })

  it('should return the same port for a single port', () => {
    expect(formatPortRanges(['1/1/1'])).toBe('1/1/1')
  })

  it('should format consecutive ports as a range', () => {
    expect(formatPortRanges(['1/1/1', '1/1/2', '1/1/3'])).toBe('1/1/1 to 1/1/3')
  })

  it('should handle multiple ranges', () => {
    expect(formatPortRanges(
      ['1/1/1', '1/1/2', '2/1/1', '2/1/2'])).toBe('1/1/1 to 1/1/2, 2/1/1 to 2/1/2')
  })

  it('should handle non-consecutive ports', () => {
    expect(formatPortRanges(['1/1/1', '1/1/3', '1/1/5'])).toBe('1/1/1, 1/1/3, 1/1/5')
  })

  it('should handle complex port lists', () => {
    const ports = [
      '1/1/1', '1/1/2', '1/1/3', '1/1/4', '1/1/5',
      '2/1/1', '2/1/2', '2/1/3',
      '3/1/10', '3/1/11', '3/1/12'
    ]
    expect(formatPortRanges(ports)).toBe('1/1/1 to 1/1/5, 2/1/1 to 2/1/3, 3/1/10 to 3/1/12')
  })

  it('should handle the example from the user', () => {
    // Create a large array of ports
    const ports: string[] = []

    // Add ports for slot 1
    for (let i = 1; i <= 48; i++) {
      ports.push(`1/1/${i}`)
    }

    // Add ports for slot 2
    for (let i = 1; i <= 48; i++) {
      ports.push(`2/1/${i}`)
    }

    // Add ports for slot 3
    for (let i = 1; i <= 48; i++) {
      ports.push(`3/1/${i}`)
    }

    expect(formatPortRanges(ports)).toBe('1/1/1 to 1/1/48, 2/1/1 to 2/1/48, 3/1/1 to 3/1/48')
  })
  it('should handle a single port with an invalid format', () => {
    expect(formatPortRanges(['invalid-port'])).toBe('invalid-port')
  })

  it('should handle ports that are not sorted', () => {
    expect(formatPortRanges(['1/1/3', '1/1/1', '1/1/2'])).toBe('1/1/1 to 1/1/3')
  })

  it('should handle ports with different slot numbers', () => {
    expect(formatPortRanges(['1/1/1', '2/1/1', '1/1/2'])).toBe('1/1/1 to 1/1/2, 2/1/1')
  })

  it('should handle ports with different chassis numbers', () => {
    expect(formatPortRanges(['1/1/1', '2/2/1', '1/1/2'])).toBe('1/1/1 to 1/1/2, 2/2/1')
  })

  it('should handle ports with large numbers', () => {
    expect(formatPortRanges(['1/1/1000', '1/1/1001', '1/1/1002'])).toBe('1/1/1000 to 1/1/1002')
  })

  it('should handle ports with mixed separators', () => {
    expect(formatPortRanges(['1-1-1', '1/1/2'])).toBe('1-1-1, 1/1/2')
  })
  it('should sort ports by port number when slot numbers are the same', () => {
    const ports = ['1/3/1', '1/1/1', '1/2/1', '1/1/2']
    const result = formatPortRanges(ports)
    expect(result).toBe('1/1/1 to 1/1/2, 1/2/1, 1/3/1')
  })
  it('should sort ports by port number when slot numbers are same', () => {
    const ports = ['1/3/1', '1/1/1', '1/2/1']
    const result = formatPortRanges(ports)
    expect(result).toBe('1/1/1, 1/2/1, 1/3/1')
  })
})