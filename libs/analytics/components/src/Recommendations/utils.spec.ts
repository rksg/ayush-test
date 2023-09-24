import { crrmText } from './utils'

describe('crrmText', () => {
  it('should return correct text for current configuration', () => {
    const testCases = [
      {
        config: [
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_AUTO',
            radio: '2.4',
            autoCellSizing: 'false'
          }
        ],
        expectedText: 'Background scanning and Auto for 2.4 GHz with static AP Tx Power'
      },
      {
        config: [
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_80MHZ',
            radio: '5',
            autoCellSizing: 'true'
          }
        ],
        expectedText: 'ChannelFly and 80 MHz for 5 GHz with Auto Cell Sizing on'
      },
      {
        config: [
          {
            channelMode: 'NONE',
            channelWidth: '_80_80MHZ',
            radio: '6',
            autoCellSizing: 'true'
          }
        ],
        expectedText: 'Disabled and 80+80 MHz for 6 GHz with Auto Cell Sizing on'
      },
      {
        config: [
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_20MHZ',
            radio: '5',
            autoCellSizing: 'false'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_80_80MHZ',
            radio: 'lower 5',
            autoCellSizing: 'true'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_160MHZ',
            radio: 'upper 5',
            autoCellSizing: 'false'
          }
        ],
        expectedText: 'Background scanning and 20 MHz for 5 GHz with static AP Tx Power, Background scanning and 80+80 MHz for lower 5 GHz with Auto Cell Sizing on, Background scanning and 160 MHz for upper 5 GHz with static AP Tx Power' // eslint-disable-line max-len
      },
      {
        config: [
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_AUTO',
            radio: '5',
            autoCellSizing: 'true'
          },
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_AUTO',
            radio: 'lower 5',
            autoCellSizing: 'true'
          },
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_AUTO',
            radio: 'upper 5',
            autoCellSizing: 'true'
          }
        ],
        expectedText: 'ChannelFly and Auto for 5 GHz, lower 5 GHz, and upper 5 GHz with Auto Cell Sizing on' // eslint-disable-line max-len
      },
      {
        config: [
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_20MHZ',
            radio: '5',
            autoCellSizing: 'true'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_40MHZ',
            radio: 'lower 5',
            autoCellSizing: 'false'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_40MHZ',
            radio: 'upper 5',
            autoCellSizing: 'false'
          }
        ],
        expectedText: 'ChannelFly and 20 MHz for 5 GHz with Auto Cell Sizing on, Background scanning and 40 MHz for lower 5 GHz and upper 5 GHz with static AP Tx Power' // eslint-disable-line max-len
      },
      {
        config: [
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_20MHZ',
            radio: '5',
            autoCellSizing: 'true'
          },
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_40MHZ',
            radio: 'lower 5',
            autoCellSizing: 'false'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_20MHZ',
            radio: 'upper 5',
            autoCellSizing: 'true'
          }
        ],
        expectedText: 'Background scanning and 20 MHz for 5 GHz and upper 5 GHz with Auto Cell Sizing on, ChannelFly and 40 MHz for lower 5 GHz with static AP Tx Power' // eslint-disable-line max-len
      },
      {
        config: [
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_20MHZ',
            radio: '5',
            autoCellSizing: 'false'
          },
          {
            channelMode: 'BACKGROUND_SCANNING',
            channelWidth: '_20MHZ',
            radio: 'lower 5',
            autoCellSizing: 'false'
          },
          {
            channelMode: 'CHANNEL_FLY',
            channelWidth: '_AUTO',
            radio: 'upper 5',
            autoCellSizing: 'true'
          }
        ],
        expectedText: 'Background scanning and 20 MHz for 5 GHz and lower 5 GHz with static AP Tx Power, ChannelFly and Auto for upper 5 GHz with Auto Cell Sizing on' // eslint-disable-line max-len
      },
      {
        config: [
          {
            channelMode: undefined,
            channelWidth: undefined,
            radio: '2.4',
            autoCellSizing: undefined
          }
        ],
        expectedText: 'Unknown and Unknown MHz for 2.4 GHz with static AP Tx Power'
      }
    ]
    testCases.forEach(({ config, expectedText }) => {
      expect(crrmText(config)).toBe(expectedText)
    })
  })
  it('returns correct text for recommended configuration', () => {
    expect(crrmText({
      recommended: 'crrm'
    })).toMatch('AI-Driven RRM for channel and bandwidth plan with no change in AP Tx Power')
    expect(crrmText({
      recommended: 'crrm',
      txPowerAPCount: 0
    })).toMatch('AI-Driven RRM for channel and bandwidth plan with no change in AP Tx Power')
    expect(crrmText({
      recommended: 'crrm',
      txPowerAPCount: 1
    })).toMatch('AI-Driven RRM for channel and bandwidth plan with static and reduced AP Tx Power in 1 AP') // eslint-disable-line max-len
    expect(crrmText({
      recommended: 'crrm',
      txPowerAPCount: 2
    })).toMatch('AI-Driven RRM for channel and bandwidth plan with static and reduced AP Tx Power in 2 APs') // eslint-disable-line max-len
  })
})

