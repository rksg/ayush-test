import React from 'react'

import { act }   from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueRogueAps } from './index'

const rogueAps = {
  fields: [
    'detectingAps.apName',
    'detectingAps.apMac',
    'channel',
    'rogueMac',
    'classificationPolicyName',
    'ssid',
    'locatable',
    'lastUpdTime',
    'closestAp.apSerialNumber',
    'closestAp.apName',
    'classificationRuleName',
    'cog',
    'band',
    'closestAp.snr',
    'id',
    'category',
    'numberOfDetectingAps'
  ],
  totalCount: 53,
  page: 1,
  data: [
    {
      rogueMac: '28:B3:71:1C:15:0C',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'ABT-FET',
      channel: 48,
      band: '5 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 5
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669709461',
      locatable: true
    },
    {
      rogueMac: '58:FB:96:01:B6:4C',
      category: 'Malicious',
      classificationPolicyName: 'Default profile',
      classificationRuleName: 'Same Network Rule',
      ssid: 'PoChi-Unleashed',
      channel: 48,
      band: '5 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 10
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710783',
      locatable: false
    },
    {
      rogueMac: '0C:F4:D5:D3:9A:E3',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Recover.Me-139AE0',
      channel: 1,
      band: '2.4 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 15
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710942',
      locatable: false
    },
    {
      rogueMac: 'B8:3A:5A:C8:6A:81',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'QGuest',
      channel: 11,
      band: '2.4 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 20
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710922',
      locatable: false
    },
    {
      rogueMac: '18:4B:0D:5E:BE:FC',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Arris-Guest',
      channel: 132,
      band: '5 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 25
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710603',
      locatable: false
    },
    {
      rogueMac: '7C:10:C9:69:C7:B4',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'tzuhmao_5g',
      channel: 44,
      band: '5 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 30
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710763',
      locatable: false
    },
    {
      rogueMac: 'B8:3A:5A:CA:01:60',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Hydra',
      channel: 1,
      band: '2.4 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 35
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710722',
      locatable: false
    },
    {
      rogueMac: '18:4B:0D:1E:AB:28',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Arris-Guest',
      channel: 7,
      band: '2.4 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 40
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710842',
      locatable: false
    },
    {
      rogueMac: '58:FB:96:DE:51:2B',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Configure.Me-1E5120',
      channel: 10,
      band: '2.4 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 45
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710902',
      locatable: false
    },
    {
      rogueMac: 'B8:3A:5A:C7:E9:90',
      category: 'Unclassified',
      classificationPolicyName: 'No policy matched',
      classificationRuleName: 'No rule matched',
      ssid: 'Hydra',
      channel: 44,
      band: '5 GHz',
      closestAp: {
        apSerialNumber: '121749001049',
        apName: 'TestR610',
        snr: 50
      },
      detectingAps: [
        {
          apMac: 'D8:38:FC:36:76:F0',
          apName: 'TestR610'
        }
      ],
      numberOfDetectingAps: 1,
      lastUpdTime: '1669710763',
      locatable: false
    }
  ]
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    <Form>
      {children}
    </Form>
  </Provider>
}

describe.skip('RogueVenueTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })
  })

  it('should render VenueRogueAps successfully', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getOldVenueRogueAp.url,
        (_, res, ctx) => res(ctx.json(rogueAps))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ apMac: '11:22:33:44:55:66' }], totalCount: 0 }))
      )
    )
    render(
      <VenueRogueAps />
      , {
        wrapper: wrapper,
        route: {
          params: { venueId: 'venueId1', tenantId: 'tenantId1' }
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByRole('columnheader', {
      name: /bssid/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /category/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /classification rule/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /channel/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /band/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /snr/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /closest ap/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /detecting aps/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /last seen/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /locate rogue/i
    })).toBeTruthy()

    await screen.findAllByText(/2022\/11\/29/i)

    // for SNR
    screen.getByText(/^50/i)
    screen.getByText(/^45/i)
    screen.getByText(/^40/i)
    screen.getByText(/^35/i)
    screen.getByText(/^30/i)
    screen.getByText(/^25/i)
    screen.getByText(/^15/i)

    await userEvent.click(await screen.findByTestId('VenueMarkerRed'))
    await screen.findByText('Cancel')

    // await userEvent.click(await screen.findByText('Cancel'))
    // FIXME: "Expect" is required here
  })
})
