import { CorrectRadioChannels } from './RadioSettingsUtils'


const mockAvailableChannels = {
  '2.4GChannels': {
    'auto': ['6', '7', '8', '9', '10', '11'],
    '20MHz': ['6', '7', '8', '9', '10', '11'],
    '40MHz': ['6','7', '8', '9', '10', '11']
  },
  '5GChannels': {
    indoor: {
      'auto': ['52', '56', '60', '64', '100', '104', '108', '112'],
      '20MHz': ['52', '56', '60', '64', '100', '104', '108', '112', '116'],
      '40MHz': ['52', '56', '60', '64', '100', '104', '108', '112'],
      '80MHz': ['52', '56', '60', '64', '100', '104', '108', '112'],
      '160MHz': ['52', '56', '60', '64', '100', '104', '108', '112']
    },
    outdoor: {
      'auto': ['132', '136', '140', '144', '149', '153', '157', '161'],
      '20MHz': ['132', '136', '140', '144', '149', '153', '157', '161', '165'],
      '40MHz': ['132', '136', '140', '144', '149', '153', '157', '161'],
      '80MHz': ['132', '136', '140', '144', '149', '153', '157', '161'],
      '160MHz': ['132', '136', '140', '144', '149', '153', '157', '161']
    },
    dfs: {},
    indoorForOutdoorAp: {}
  },
  '6GChannels': {
    'auto': ['1','5','9','13','17','21','25','29'],
    '20MHz': ['1','5','9','13','17','21','25','33'],
    '40MHz': ['1','5','9','13','17','21','25','29'],
    '80MHz': ['1','5','9','13','17','21','25','29'],
    '160MHz': ['1','5','9','13','17','21','25','29']
  }
}

describe('RadioSetting Utils test', () => {
  it('should the CorrectRadioChannels function work', async () => {
    const radio24G = {
      allowedChannels: ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11'],
      channelBandwidth: 'AUTO'
    }
    const supportCh24G = mockAvailableChannels['2.4GChannels']
    const newRadio24G = CorrectRadioChannels(radio24G, supportCh24G)

    expect(newRadio24G.allowedChannels).toEqual(['6', '7', '8', '9', '10', '11'])

    const venueRadio5G = {
      allowedIndoorChannels: ['36', '40', '44', '100', '104', '108'],
      allowedOutdoorChannels: ['100', '104', '108', '112', '116', '120', '153', '157', '161'],
      channelBandwidth: '20MHz'
    }

    const supportCh5G = mockAvailableChannels['5GChannels']
    const newRadio5G = CorrectRadioChannels(venueRadio5G, supportCh5G)

    expect(newRadio5G.allowedIndoorChannels).toEqual(['100', '104', '108'])
    expect(newRadio5G.allowedOutdoorChannels).toEqual(['153', '157', '161'])
  })

  it('should the CorrectRadioChannels function work without config data', async () => {
    const radio24G = {
      channelBandwidth: 'AUTO'
    }
    const supportCh24G = mockAvailableChannels['2.4GChannels']
    const newRadio24G = CorrectRadioChannels(radio24G, supportCh24G)

    expect(newRadio24G.allowedChannels).toBeUndefined()

    const venueRadio5G = {
      channelBandwidth: '20MHz'
    }

    const supportCh5G = mockAvailableChannels['5GChannels']
    const newRadio5G = CorrectRadioChannels(venueRadio5G, supportCh5G)

    expect(newRadio5G.allowedIndoorChannels).toBeUndefined()
    expect(newRadio5G.allowedOutdoorChannels).toBeUndefined()
  })

  it('should the CorrectRadioChannels function work without support channel data', async () => {
    const radio24G = {
      allowedChannels: ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11'],
      channelBandwidth: 'AUTO'
    }
    const supportCh24G = {}
    const newRadio24G = CorrectRadioChannels(radio24G, supportCh24G)

    expect(newRadio24G.allowedChannels).toEqual([])

    const venueRadio5G = {
      allowedIndoorChannels: ['36', '40', '44', '100', '104', '108'],
      allowedOutdoorChannels: ['100', '104', '108', '112', '116', '120', '153', '157', '161'],
      channelBandwidth: '20MHz'
    }

    const supportCh5G = {}
    const newRadio5G = CorrectRadioChannels(venueRadio5G, supportCh5G)

    expect(newRadio5G.allowedIndoorChannels).toEqual([])
    expect(newRadio5G.allowedOutdoorChannels).toEqual([])

    const newRadio = CorrectRadioChannels(radio24G, undefined)
    expect(newRadio.allowedChannels).toEqual([])
  })
})