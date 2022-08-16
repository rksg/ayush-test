import '@testing-library/jest-dom'

import { dataApiURL }                                      from '@acx-ui/analytics/services'
import { Incident }                                        from '@acx-ui/analytics/utils'
import { Provider, store }                                 from '@acx-ui/store'
import { mockGraphqlQuery, mockAutoSizer, render, screen } from '@acx-ui/test-utils'

import {
  api,
  IncidentNodeData
} from './services'

import IncidentTableWidget from '.'

const incidentTest = [{
  severity: 0.3813119146230035,
  startTime: '2022-07-21T01:15:00.000Z',
  endTime: '2022-07-21T01:18:00.000Z',
  code: 'auth-failure',
  sliceType: 'zone',
  sliceValue: 'Venue-3-US',
  id: '268a443a-e079-4633-9491-536543066e7d',
  path: [
    {
      type: 'zone',
      name: 'Venue-3-US'
    }
  ],
  metadata: {
    dominant: {
      ssid: 'qa-eric-acx-R760-psk'
    },
    rootCauseChecks: {
      checks: [
        {
          CCD_REASON_NOT_AUTHED: true
        }
      ],
      params: {}
    }
  },
  clientCount: 2,
  impactedClientCount: 2,
  isMuted: false,
  mutedBy: null,
  mutedAt: null,
  apCount: 0,
  impactedApCount: 0,
  switchCount: 0,
  vlanCount: 0,
  connectedPowerDeviceCount: 0,
  slaThreshold: null,
  currentSlaThreshold: null
}] as Incident[] as IncidentNodeData

describe('IncidentTableWidget', () => {
  mockAutoSizer()

  beforeEach(() => 
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTest } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render table', async () => {
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: incidentTest } } }
    })
    render(<Provider><IncidentTableWidget/></Provider>, {
      route: {
        path: '/t/tenantId/analytics/incidents',
        wrapRoutes: false
      }
    })
    await screen.findByText('P4')
    expect(screen.getByText('P4').textContent).toBe('P4')
  })
})