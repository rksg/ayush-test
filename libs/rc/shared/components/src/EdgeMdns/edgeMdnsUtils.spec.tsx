import { edgeMdnsFormRequestPreProcess } from './edgeMdnsUtils'

describe('edgeMdnsFormRequestPreProcess', () => {
  it('correctly transform', () => {
    // TODO: add more
    const result = edgeMdnsFormRequestPreProcess({
      name: 'test',
      forwardingRules: [
      ],
      activations: []
    })
    expect(result).toStrictEqual([])
  })
})