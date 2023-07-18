/* eslint-disable testing-library/no-node-access */
import { cleanup } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'


import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  SelectItemOption,
  split5GChannels
} from './RadioSettingsContents'
import { SingleRadioSettings } from './SingleRadioSettings'


describe('SignaleRadioSettings component', () => {

  const validRadioChannels = {
    '2.4GChannels': {
      'auto': ['1','2','3','4','5','6','7','8','9','10','11'],
      '20MHz': ['1','2','3','4','5','6','7','8','9','10','11'],
      '40MHz': ['1','2','3','4', '5','6','7','8','9','10','11']
    },
    '5GChannels': {
      indoor: {
        'auto': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128',
          '132','136','140','144','149','153','157','161'
        ],
        '20MHz': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128',
          '132','136','140','144','149','153','157','161',
          '165'
        ],
        '40MHz': ['36','40','44','48',
          '52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '80MHz': ['36','40','44','48',
          '52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '160MHz': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128'
        ]
      },
      outdoor: {
        'auto': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128',
          '132','136','140','144','149','153','157','161'
        ],
        '20MHz': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128',
          '132','136','140','144','149','153','157','161','165'
        ],
        '40MHz': ['36','40','44','48',
          '52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '80MHz': ['36','40','44','48',
          '52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '160MHz': ['36','40','44','48','52','56','60','64',
          '100','104','108','112','116','120','124','128'
        ]
      },
      dfs: {
        'auto': ['52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '20MHz': ['52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '40MHz': ['52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '80MHz': ['52','56','60','64',
          '100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '160MHz': ['52','56','60','64','100','104','108','112',
          '116','120','124','128','132','136','140','144'
        ]
      },
      indoorForOutdoorAp: {}
    },
    '5GLowerChannels': {
      indoor: {
        'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
      },
      outdoor: {
        'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
        '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
      },
      dfs: {
        'auto': ['52', '56', '60', '64'],
        '20MHz': ['52', '56', '60', '64'],
        '40MHz': ['52', '56', '60', '64'],
        '80MHz': ['52', '56', '60', '64'],
        '160MHz': ['52', '56', '60', '64']
      }
    },
    '5GUpperChannels': {
      indoor: {
        'auto': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '20MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161',
          '165'
        ],
        '40MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '80MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
      },
      outdoor: {
        'auto': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '20MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161',
          '165'
        ],
        '40MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '80MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144',
          '149','153','157','161'
        ],
        '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
      },
      dfs: {
        'auto': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '20MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '40MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '80MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ],
        '160MHz': ['100','104','108','112',
          '116','120','124','128',
          '132','136','140','144'
        ]
      }
    },
    '6GChannels': {
      'auto': ['1','5','9','13',
        '17','21','25','29',
        '33','37','41','45',
        '49','53','57','61',
        '65','69','73','77',
        '81','85','89','93',
        '97','101','105','109',
        '113','117','121','125',
        '129','133','137','141',
        '145','149','153','157',
        '161','165','169','173',
        '177','181','185','189',
        '193','197','201','205',
        '209','213','217','221'
      ],
      '20MHz': ['1','5','9','13',
        '17','21','25','29',
        '33','37','41','45',
        '49','53','57','61',
        '65','69','73','77',
        '81','85','89','93',
        '97','101','105','109',
        '113','117','121','125',
        '129','133','137','141',
        '145','149','153','157',
        '161','165','169','173',
        '177','181','185','189',
        '193','197','201','205',
        '209','213','217','221',
        '225','229','233'
      ],
      '40MHz': ['1','5','9','13',
        '17','21','25','29',
        '33','37','41','45',
        '49','53','57','61',
        '65','69','73','77',
        '81','85','89','93',
        '97','101','105','109',
        '113','117','121','125',
        '129','133','137','141',
        '145','149','153','157',
        '161','165','169','173',
        '177','181','185','189',
        '193','197','201','205',
        '209','213','217','221',
        '225','229'
      ],
      '80MHz': ['1','5','9','13',
        '17','21','25','29',
        '33','37','41','45',
        '49','53','57','61',
        '65','69','73','77',
        '81','85','89','93',
        '97','101','105','109',
        '113','117','121','125',
        '129','133','137','141',
        '145','149','153','157',
        '161','165','169','173',
        '177','181','185','189',
        '193','197','201','205',
        '209','213','217','221'
      ],
      '160MHz': ['1','5','9','13',
        '17','21','25','29',
        '33','37','41','45',
        '49','53','57','61',
        '65','69','73','77',
        '81','85','89','93',
        '97','101','105','109',
        '113','117','121','125',
        '129','133','137','141',
        '145','149','153','157',
        '161','165','169','173',
        '177','181','185','189',
        '193','197','201','205',
        '209','213','217','221'
      ]
    }
  }

  afterEach(() => cleanup())

  it('should render Venue Radio 24G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio24G
    const bandwidthOptions = channelBandwidth24GOptions
    const supportCh = validRadioChannels['2.4GChannels']
    const resetToDefaultSpy = jest.fn()

    const { asFragment } = render (
      <Provider>
        <Form>
          <SingleRadioSettings
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
            onResetDefaultValue={resetToDefaultSpy}
          />
        </Form>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('Channel Fly')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const channelSelecter = asFragment().querySelector('#radioParams24G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it('should render Venue Radio 5G singleRadioSettings', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const radioType = ApRadioTypeEnum.Radio5G
    const bandwidthOptions = channelBandwidth5GOptions
    const supportCh = validRadioChannels['5GChannels']
    const resetToDefaultSpy = jest.fn()

    const { asFragment } = render (
      <Provider>
        <Form>
          <SingleRadioSettings
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
            onResetDefaultValue={resetToDefaultSpy}
          />
        </Form>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('Channel Fly')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('80 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('80 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const indoorChannelsId = '#radioParams50G_allowedIndoorChannels'
    const outdoorChannelsId = '#radioParams50G_allowedOutdoorChannels'

    const indoorChannelSelecter = asFragment().querySelector(indoorChannelsId)
    expect(indoorChannelSelecter).toEqual(expect.anything())

    const outdoorChannelSelecter = asFragment().querySelector(outdoorChannelsId)
    expect(outdoorChannelSelecter).toEqual(expect.anything())
  })

  it('should render Venue Radio 6G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio6G
    const bandwidthOptions = channelBandwidth6GOptions
    const supportCh = validRadioChannels['6GChannels']
    const resetToDefaultSpy = jest.fn()

    const { asFragment } = render (
      <Provider>
        <Form>
          <SingleRadioSettings
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
            onResetDefaultValue={resetToDefaultSpy}
          />
        </Form>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).toHaveAttribute('disabled')

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const resetDefaultBtn = await screen.findByRole('button',
      { name: /Reset to Default Settings/i })
    expect(resetDefaultBtn).not.toEqual(null)
    expect(resetToDefaultSpy).not.toHaveBeenCalled()
    await userEvent.click(resetDefaultBtn)
    expect(resetToDefaultSpy).toHaveBeenCalled()

    const channelSelecter = asFragment().querySelector('#radioParams6G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())

  })

  it('should render AP Radio 24G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio24G
    const bandwidthOptions = channelBandwidth24GOptions
    const supportCh = validRadioChannels['2.4GChannels']

    const { asFragment } = render (
      <Provider>
        <Form>
          <SingleRadioSettings
            context='ap'
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
            isUseVenueSettings={false}
          />
        </Form>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
    await userEvent.click((await screen.findByTitle('Manual channel selection')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)

    await userEvent.click((await screen.findByRole('option', { name: 'Auto' })))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const channelSelecter = asFragment().querySelector('#apRadioParams24G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it('should render AP Radio 6G singleRadioSettings', async () => {
    const radioType = ApRadioTypeEnum.Radio6G
    const bandwidthOptions = channelBandwidth6GOptions
    const supportCh = validRadioChannels['6GChannels']

    const { asFragment } = render (
      <Provider>
        <Form>
          <SingleRadioSettings
            context='ap'
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
            isUseVenueSettings={false}
          />
        </Form>
      </Provider>
    )

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
    await userEvent.click((await screen.findByTitle('Manual channel selection')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    await userEvent.click((await screen.findByRole('option', { name: 'Auto' })))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const channelSelecter = asFragment().querySelector('#apRadioParams6G_allowedChannels')
    expect(channelSelecter).toEqual(expect.anything())
  })

  it ('test the split5GChannels function', () => {
    const channels = validRadioChannels['5GChannels'].indoor['160MHz']
    const { lower5GChannels, upper5GChannels } = split5GChannels(channels)

    expect(lower5GChannels).toEqual(['36','40','44','48','52','56','60','64'])
    expect(upper5GChannels).toEqual(['100','104','108','112','116','120','124','128'])
  })

  it ('should show not support info when no bandwidthOptions', async () => {
    const radioType = ApRadioTypeEnum.Radio6G
    const bandwidthOptions = [] as SelectItemOption[]
    const supportCh = validRadioChannels['6GChannels']

    render (
      <Provider>
        <Form>
          <SingleRadioSettings
            radioType={radioType}
            bandwidthOptions={bandwidthOptions}
            supportChannels={supportCh}
          />
        </Form>
      </Provider>
    )

    const noSupportInfoDiv = await screen
      .findByText('This band is not supported for APs in current country')
    expect(noSupportInfoDiv).toEqual(expect.anything())
  })

})
