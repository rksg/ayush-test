import { formatVariableValue } from './CliVariableUtils'

describe('Test formatVariableValue function', () => {
  it('should render correctly', async () => {
    const variables = [{
      name: 'testRange',
      rangeEnd: 98,
      rangeStart: 88,
      type: 'RANGE'
    }, {
      ipAddressEnd: '1.1.1.10',
      ipAddressStart: '1.1.1.1',
      name: 'testIp',
      subMask: '255.255.254.0',
      type: 'ADDRESS'
    }, {
      name: 'testString',
      type: 'STRING',
      string: 'test-string'
    }]

    expect(formatVariableValue(variables[0])).toBe('88:98')
    expect(formatVariableValue(variables[1])).toBe('1.1.1.1_1.1.1.10_255.255.254.0')
    expect(formatVariableValue(variables[2])).toBe('test-string')
  })
})