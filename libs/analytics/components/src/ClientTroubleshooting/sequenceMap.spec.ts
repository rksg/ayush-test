import { getRCCDFlow } from './sequenceMap'

describe('sequenceMap', () => {
  it('should return expected object', () => {
    const rccdFlow = getRCCDFlow({ messageIds: [1, 2], failedMsgId: 1 })
    expect(rccdFlow).toStrictEqual({
      layers: [
        'Client Device',
        'Access Point ({apMac})'
      ],
      steps: [
        {
          column: [1, 2],
          direction: 'right',
          label: 'Probe Request',
          state: 'failed'
        },
        {
          column: [1, 2],
          direction: 'right',
          label: '802.11 Authentication Request',
          state: 'normal'
        }
      ]
    })
  })

  it('should return null object', () => {
    const nullFlow = getRCCDFlow({ messageIds: [1, 2], failedMsgId: 3 })
    expect(nullFlow).toStrictEqual({
      layers: [
        'Client Device',
        'Access Point ({apMac})'
      ],
      steps: [
        {
          column: [1, 2],
          direction: 'right',
          label: 'Probe Request',
          state: 'normal'
        },
        {
          column: [1, 2],
          direction: 'right',
          label: '802.11 Authentication Request',
          state: 'normal'
        }
      ]
    })
  })

  // todo: one more case for left
})