import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ReportsRoutes from './Routes'

jest.mock('./pages/Report', () => ({
  Report: () => <div data-testid='someReport' />
}))

test('should navigate to reports/network/wireless', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/reports/wireless',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('someReport')).toBeTruthy()
})
