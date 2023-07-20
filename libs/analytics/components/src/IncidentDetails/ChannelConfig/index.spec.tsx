import { fakeIncident }                     from '@acx-ui/analytics/utils'
import type { Incident }                    from '@acx-ui/analytics/utils'
import { dataApiURL, Provider }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { ChannelConfig } from '.'

import type { ChannelResponse } from './services'

const mockIncident = (network: ChannelResponse, code: Incident['code']) => {
  mockGraphqlQuery(dataApiURL, 'Config', {
    data: { network }
  })
  return fakeIncident({
    apCount: -1,
    isMuted: false,
    mutedBy: null,
    slaThreshold: null,
    clientCount: 27,
    path: [
      {
        type: 'zone',
        name: 'Edu2-611-Mesh'
      },
      {
        type: 'apGroup',
        name: '255_Edu2-611-group'
      }
    ],
    endTime: '2022-07-20T02:42:00.000Z',
    vlanCount: -1,
    sliceType: 'apGroup',
    code,
    startTime: '2022-07-19T05:15:00.000Z',
    metadata: {},
    id: 'df5339ba-da3b-4110-a291-7f8993a274f3',
    impactedApCount: -1,
    switchCount: -1,
    currentSlaThreshold: null,
    severity: 0.674055825227442,
    connectedPowerDeviceCount: -1,
    mutedAt: null,
    impactedClientCount: 5,
    sliceValue: 'RuckusAP'
  })
}

describe('ChannelConfig', () => {
  it('should render for incidents on 2.4GHz', async () => {
    const incident = mockIncident({
      apGroup: {
        channel: [],
        channelRange: [{ values: ['10', '20'] }],
        channelWidth: []
      },
      zone: {
        channel: [{ values: ['AUTO'] }],
        channelRange: [{ values: ['30', '40'] }],
        channelWidth: [{ values: ['_AUTO'] }]
      }
    }, 'p-channeldist-suboptimal-plan-24g')
    const { asFragment } = render(
      <Provider>
        <ChannelConfig incident={incident} />
      </Provider>
    )
    expect(await screen.findAllByText('Auto')).toHaveLength(2)
    await screen.findByText('Channel Range (2.4 GHz)')
    await screen.findByText('10, 20')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render for incidents on 5GHz', async () => {
    const incident = mockIncident({
      apGroup: {
        channel: [],
        channelRange: [],
        channelWidth: []
      },
      zone: {
        channel: [],
        channelRange: [{ values: ['30', '40'] }],
        channelWidth: [{ values: ['_80MHZ'] }]
      }
    }, 'p-channeldist-suboptimal-plan-50g-outdoor')
    render(
      <Provider>
        <ChannelConfig incident={incident} />
      </Provider>
    )
    await screen.findByText('80 MHz')
    await screen.findByText('Channel Range (5 GHz)')
    await screen.findByText('30, 40')
  })
})
