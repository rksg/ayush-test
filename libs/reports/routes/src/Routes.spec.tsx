import { MLISA_BASE_PATH }          from '@acx-ui/react-router-dom'
import { Provider }                 from '@acx-ui/store'
import { logRoles, render, screen } from '@acx-ui/test-utils'

import ReportsRoutes from './Routes'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  Report: () => <div data-testid={'some-report-id'} id='acx-report' />
}))

test('should navigate to reports/wireless for R1', async () => {
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
  const currentValue = process.env.NX_IS_MLISA_SA
  process.env.NX_IS_MLISA_SA = 'true'
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: MLISA_BASE_PATH+'/reports/wireless',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('some-report-id')).toBeDefined()
  process.env.NX_IS_MLISA_SA = currentValue
})
