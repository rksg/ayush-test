import { defineMessage } from 'react-intl'

import { getRCCDFlow } from './sequenceMap'

describe('sequenceMap', () => {
  it('should return expected object', () => {
    const rccdFlow = getRCCDFlow({ messageIds: ['1', '2'], failedMsgId: '1' })
    expect(rccdFlow).toStrictEqual({
      layers: [
        defineMessage({ defaultMessage: 'Client Device' }),
        defineMessage({ defaultMessage: 'AP ({apMac})' })
      ],
      steps: [
        {
          column: [1, 2],
          direction: 'right',
          label: defineMessage({ defaultMessage: 'Probe Request' }),
          state: 'failed'
        },
        {
          column: [1, 2],
          direction: 'right',
          label: defineMessage({ defaultMessage: '802.11 Authentication Request' }),
          state: 'normal'
        }
      ]
    })
  })

  it('should return empty flow', () => {
    const emptyFlow = getRCCDFlow({ messageIds: [], failedMsgId: '' })
    expect(emptyFlow).toStrictEqual({ layers: [], steps: [] })
  })

  it('should return null flow', () => {
    const nullFlow = getRCCDFlow({ messageIds: ['a'], failedMsgId: '' })
    expect(nullFlow).toStrictEqual({ layers: [], steps: [] })
  })

  it('should return left direction object', () => {
    const leftFlow = getRCCDFlow({ messageIds: ['21'], failedMsgId: '21' })
    expect(leftFlow).toStrictEqual({
      layers: [
        defineMessage({ defaultMessage: 'Client Device' }),
        defineMessage({ defaultMessage: 'AP ({apMac})' })
      ],
      steps: [
        {
          column: [1, 2],
          direction: 'left',
          label: defineMessage({ defaultMessage: '4-Way Handshake - Frame 1' }),
          state: 'failed'
        }
      ]
    })
  })
})