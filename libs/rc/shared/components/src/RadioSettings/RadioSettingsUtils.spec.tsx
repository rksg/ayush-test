import {
  channelBandwidth24GOptions as Bandwidth24GOptions,
  channelBandwidth5GOptions as Bandwidth5GOptions,
  channelBandwidth6GOptions as Bandwidth6GOptions
} from './RadioSettingsContents'
import {
  CorrectRadioChannels,
  GetSupportBandwidth,
  GetSupportIndoorOutdoorBandwidth
} from './RadioSettingsUtils'


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
    '160MHz': ['1','5','9','13','17','21','25','29'],
    '320MHz': ['1','5','9','13','17','21','25','29']
  }
}

describe('RadioSetting Utils test', () => {
  it('CorrectRadioChannels function should be work', () => {
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

  it('CorrectRadioChannels function work without config data should be work', () => {
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

  it('CorrectRadioChannels function work without support channel data should be work', () => {
    const radio24G = {
      allowedChannels: ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11'],
      channelBandwidth: 'AUTO'
    }
    const supportCh24G = {}
    const newRadio24G = CorrectRadioChannels(radio24G, supportCh24G)

    expect(newRadio24G.allowedChannels).toEqual(undefined)

    const venueRadio5G = {
      allowedIndoorChannels: ['36', '40', '44', '100', '104', '108'],
      allowedOutdoorChannels: ['100', '104', '108', '112', '116', '120', '153', '157', '161'],
      channelBandwidth: '20MHz'
    }

    const supportCh5G = {}
    const newRadio5G = CorrectRadioChannels(venueRadio5G, supportCh5G)

    expect(newRadio5G.allowedIndoorChannels).toEqual(undefined)
    expect(newRadio5G.allowedOutdoorChannels).toEqual(undefined)

    const newRadio = CorrectRadioChannels(radio24G, undefined)
    expect(newRadio.allowedChannels).toEqual(undefined)
  })


  it('GetSupportBandwidth function should be work', () => {
    const supportCh24G = mockAvailableChannels['2.4GChannels']
    const bandwidth24G = GetSupportBandwidth(Bandwidth24GOptions, supportCh24G)
    expect(bandwidth24G).toEqual(Bandwidth24GOptions)

    const supportMissIndoorCh5G = {
      'auto': ['52', '56', '60', '64', '100', '104', '108', '112'],
      '20MHz': ['52', '56', '60', '64', '100', '104', '108', '112', '116'],
      '40MHz': ['52', '56', '60', '64', '100', '104', '108', '112']
    }
    const bandwidth5G = GetSupportBandwidth(Bandwidth5GOptions, supportMissIndoorCh5G)
    expect(bandwidth5G).toEqual(Bandwidth24GOptions) // only have the auto, 20MHz, and 40MHz

    const supportIndoorCh5G = mockAvailableChannels['5GChannels']['indoor']
    const bandwidthIndoor5G = GetSupportBandwidth(Bandwidth5GOptions, supportIndoorCh5G, {
      isSupport160Mhz: false
    })
    expect(bandwidthIndoor5G).toEqual([
      { label: 'Auto', value: 'AUTO' },
      { label: '20 MHz', value: '20MHz' },
      { label: '40 MHz', value: '40MHz' },
      { label: '80 MHz', value: '80MHz' }
    ]) // the same as 5GOptions but doesn't include 160MHz

    const supportCh6G = mockAvailableChannels['6GChannels']
    const bandwidth6G = GetSupportBandwidth(Bandwidth6GOptions, supportCh6G)
    expect(bandwidth6G).toEqual(Bandwidth6GOptions)

    const apBandwidth6G = GetSupportBandwidth(Bandwidth6GOptions, supportCh6G, {
      //isSupport160Mhz: false,
      isSupport320Mhz: false })

    expect(apBandwidth6G).toEqual([
      { label: 'Auto', value: 'AUTO' },
      { label: '20 MHz', value: '20MHz' },
      { label: '40 MHz', value: '40MHz' },
      { label: '80 MHz', value: '80MHz' }
    ]) // the same as 6GOptions but doesn't include 160MHz and 320MHz

    const apBandwidth6G_allSupport = GetSupportBandwidth(Bandwidth6GOptions, supportCh6G, {
      isSupport160Mhz: true,
      isSupport320Mhz: true })
    expect(apBandwidth6G_allSupport).toEqual(Bandwidth6GOptions)
  })

  it('GetSupportIndoorOutdoorBandwidth function should be work', () => {
    const supportCh5G = mockAvailableChannels['5GChannels']
    const bandwidth5G = GetSupportIndoorOutdoorBandwidth(Bandwidth5GOptions, supportCh5G)
    expect(bandwidth5G).toEqual(Bandwidth5GOptions)

    const specialSupportCh = {
      indoor: {
        'auto': ['52', '56', '60', '64', '100', '104', '108', '112'],
        '20MHz': ['52', '56', '60', '64', '100', '104', '108', '112', '116'],
        '80MHz': ['52', '56', '60', '64', '100', '104', '108', '112']
      },
      outdoor: {
        'auto': ['132', '136', '140', '144', '149', '153', '157', '161'],
        '20MHz': ['132', '136', '140', '144', '149', '153', '157', '161', '165'],
        '40MHz': ['132', '136', '140', '144', '149', '153', '157', '161'],
        '80MHz': ['132', '136', '140', '144', '149', '153', '157', '161']
      },
      dfs: {},
      indoorForOutdoorAp: {}
    }

    const specialBandwidth = GetSupportIndoorOutdoorBandwidth(Bandwidth5GOptions, specialSupportCh)
    expect(specialBandwidth).toEqual([
      { label: 'Auto', value: 'AUTO' },
      { label: '20 MHz', value: '20MHz' },
      { label: '40 MHz', value: '40MHz' },
      { label: '80 MHz', value: '80MHz' }
    ])

    const emptyBandwidth = GetSupportIndoorOutdoorBandwidth(Bandwidth5GOptions, {})
    expect(emptyBandwidth).toEqual([])
  })
})