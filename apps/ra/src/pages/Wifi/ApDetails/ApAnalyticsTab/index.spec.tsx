import '@testing-library/jest-dom'
import * as router                   from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'
import type { AnalyticsFilter }      from '@acx-ui/utils'

import { ApAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))
jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentTabContent: (props: { filters: AnalyticsFilter }) => JSON.stringify(props.filters),
  HealthPage: (props: { filters: AnalyticsFilter }) => JSON.stringify(props.filters)
}))

const apContext = { apId: '70:CA:97:01:9D:90' , networkPath: [{
  name: 'Alphanet-BDC',
  type: 'system'
},
{
  name: 'default',
  type: 'apGroup'
},
{
  name: '70:CA:97:01:9D:90',
  type: 'AP'
}
] }

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => apContext
}))

describe('ApAnalyticsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ apId: '60:9C:9F:52:C9:86' })
    )

    render(<Provider>
      <ApAnalyticsTab />
    </Provider>, {
      route: {
        params: { apId: '60:9C:9F:52:C9:86' },
        path: '/devices/wifi/:apId/details/analytics'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/devices/wifi/60:9C:9F:52:C9:86/details/analytics/health/overview'
    )
  })
})
