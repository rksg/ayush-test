import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider, dataApiURL }                        from '@acx-ui/store'
import { render, screen, fireEvent, mockGraphqlQuery } from '@acx-ui/test-utils'

import { VenueAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))


const fakeSummary = {
  network: {
    timeSeries: {
      connectionSuccessAndAttemptCount: [[50762, 107231]]
    },
    avgTTC: {
      incidentCharts: {
        ttc: [39502.44053058643]
      }
    }
  }
}

describe('VenueAnalyticsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
    mockGraphqlQuery(dataApiURL, 'IncidentsBySeverityWidget', {
      data: { network: { hierarchyNode: { P1: 0, P2: 2, P3: 3, P4: 4 } } }
    })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {
        timeToConnectThreshold: { value: 30000 }
      }
    })
    mockGraphqlQuery(dataApiURL, 'KPI', {
      data: {
        mutationAllowed: true
      }
    })
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
    mockGraphqlQuery(dataApiURL, 'NetworkHistoryWidget', {
      data: { network: { hierarchyNode: { timeSeries: {
        time: [
          '2022-04-07T09:15:00.000Z',
          '2022-04-07T09:30:00.000Z',
          '2022-04-07T09:45:00.000Z',
          '2022-04-07T10:00:00.000Z',
          '2022-04-07T10:15:00.000Z'
        ],
        newClientCount: [1, 2, 3, 4, 5],
        impactedClientCount: [6, 7, 8, 9, 10],
        connectedClientCount: [11, 12, 13, 14, 15]
      } } } }
    })
  })

  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(() => ({}))
    render(<Provider>
      <VenueAnalyticsTab />
    </Provider>, {
      route: {
        path: '/t1/t/venues/v1/venue-details/analytics'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/venues/v1/venue-details/analytics/health/overview'
    )
  })
})
