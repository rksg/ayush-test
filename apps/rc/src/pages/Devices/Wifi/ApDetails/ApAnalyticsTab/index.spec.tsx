import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'
import type { AnalyticsFilter }      from '@acx-ui/utils'

import { ApAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))
jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentTabContent: (props: { filters: AnalyticsFilter }) => JSON.stringify(props.filters),
  HealthPage: (props: { filters: AnalyticsFilter }) => JSON.stringify(props.filters)
}))

describe('ApAnalyticsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1', serialNumber: '000000000001' })
    )
    render(<Provider>
      <ApAnalyticsTab />
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
})
