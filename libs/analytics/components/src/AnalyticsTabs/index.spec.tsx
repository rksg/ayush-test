import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'
import type { AnalyticsFilter }      from '@acx-ui/utils'

import { AnalyticsTabs } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))

jest.mock('../Incidents', () => ({
  IncidentTabContent: () => <div>IncidentTabContent</div>
}))

jest.mock('../Health', () => ({
  HealthPage: () => <div>HealthPage</div>
}))

describe('AnalyticsTabs', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1', serialNumber: '000000000001' })
    )
    render(<Provider>
      <AnalyticsTabs
        healthPath='/t1/t/devices/wifi/000000000001/details/analytics/health'
        healthFilter={{} as AnalyticsFilter}
        incidentFilter={{} as AnalyticsFilter}
      />
    </Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: '000000000001' },
        path: '/:tenantId/t/devices/wifi/:serialNumber/details/analytics'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/devices/wifi/000000000001/details/analytics/health/overview'
    )
  })
  it('should handle tab changes', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1', serialNumber: '000000000001', activeSubTab: 'incidents' })
    )
    render(<Provider>
      <AnalyticsTabs
        healthPath='/t1/t/devices/wifi/000000000001/details/analytics/health'
        healthFilter={{} as AnalyticsFilter}
        incidentFilter={{} as AnalyticsFilter}
      />
    </Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: '000000000001', activeSubTab: 'incidents' },
        path: '/:tenantId/t/devices/wifi/:serialNumber/details/analytics/incidents/overview'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t1/t/devices/wifi/000000000001/details/analytics/health/overview'
    )
  })
})
