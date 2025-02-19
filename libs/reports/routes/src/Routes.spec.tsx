import * as config                  from '@acx-ui/config'
import { MLISA_BASE_PATH }          from '@acx-ui/react-router-dom'
import { Provider }                 from '@acx-ui/store'
import { logRoles, render, screen } from '@acx-ui/test-utils'

import ReportsRoutes from './Routes'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  Report: () => <div data-testid={'some-report-id'} id='acx-report' />,
  DataSubscriptionsContent: () =>
    <div data-testid={'data-subscriptions-id'} id='acx-data-subscriptions' />
}))

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

test('should navigate to reports/wireless for R1', async () => {
  get.mockReturnValue('')
  const { container }=render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/reports/wireless',
      wrapRoutes: false
    }
  })
  logRoles(container)
  //expect(screen.getByRole('heading', { name: /wireless/i })).toBeDefined()
  expect(screen.getByTestId('some-report-id')).toBeDefined()
})

test('should navigate to reports/wireless for RA', async () => {
  get.mockReturnValue('true')
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: MLISA_BASE_PATH+'/reports/wireless',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('some-report-id')).toBeDefined()
})

test('should navigate to dataSubscriptions for R1', async () => {
  get.mockReturnValue('')
  const { container }=render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/dataSubscriptions',
      wrapRoutes: false
    }
  })
  logRoles(container)
  expect(screen.getByTestId('data-subscriptions-id')).toBeDefined()
})

test('should navigate to dataSubscriptions for RA', async () => {
  get.mockReturnValue('true')
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: MLISA_BASE_PATH+'/dataSubscriptions',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('data-subscriptions-id')).toBeDefined()
})