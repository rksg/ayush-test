import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ReportsRoutes from './Routes'

jest.mock('./pages/Report', () => ({
  Report: () => <div data-testid='someReport' />
}))

test('should redirect reports to reports/network/wireless', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('someReport')).toBeTruthy()
})
test('should navigate to reports/network/wireless', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports/wireless',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('someReport')).toBeTruthy()
})
