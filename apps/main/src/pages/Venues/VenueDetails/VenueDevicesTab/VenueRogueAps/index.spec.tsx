import React from 'react'

import { act }  from '@testing-library/react'
import { rest } from 'msw'

import { venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueRogueAps } from './index'


const rogueAps = [
  {
    rogueMac: 'B8:3A:5A:CA:01:60',
    category: 'Unclassified',
    classificationPolicyName: 'No policy matched',
    classificationRuleName: 'No rule matched',
    ssid: 'Hydra',
    channel: 11,
    band: '2.4 GHz',
    closestAp: {
      apSerialNumber: '121749001049',
      apName: 'R610-1',
      snr: 13
    },
    detectingAps: [
      {
        apMac: 'D8:38:FC:36:76:F0',
        apName: 'R610-1'
      }
    ],
    numberOfDetectingAps: 1,
    lastUpdTime: '1667354515',
    locatable: false
  },
  {
    rogueMac: '58:FB:96:01:B6:4C',
    category: 'Malicious',
    classificationPolicyName: 'Default profile',
    classificationRuleName: 'Same Network Rule',
    ssid: 'PoChi-Unleashed',
    channel: 36,
    band: '5 GHz',
    closestAp: {
      apSerialNumber: '121749001049',
      apName: 'R610-2',
      snr: 44
    },
    detectingAps: [
      {
        apMac: 'D8:38:FC:36:76:F0',
        apName: 'R610-2'
      }
    ],
    numberOfDetectingAps: 1,
    lastUpdTime: '1667355416',
    locatable: false
  }
]

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

describe('RogueVenueTable', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(venueApi.util.resetApiState())
    })
  })

  it('should render VenueRogueAps successfully', async () => {
    mockServer.use(rest.post(
      CommonUrlsInfo.getOldVenueRogueAp.url,
      (_, res, ctx) => res(
        ctx.json(rogueAps)
      )
    ))

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
      name: /classification profile/i
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
      name: /closestap/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /detecting ap/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /last seen/i
    })).toBeTruthy()
    expect(screen.getByRole('columnheader', {
      name: /locate rogue/i
    })).toBeTruthy()
  })
})
