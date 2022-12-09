import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ReportsRoutes from './Routes'

jest.mock('./pages/NetworkReport', () => ({
  NetworkReport: () => <div data-testid='networkReport' />
}))
jest.mock('./pages/Reports/Applications', () => ({
  ApplicationsReport: () => <div data-testid='applicationsReport' />
}))
jest.mock('./pages/Reports/Aps', () => ({
  ApsReport: () => <div data-testid='apsReport' />
}))
jest.mock('./pages/Reports/Clients', () => ({
  ClientsReport: () => <div data-testid='clientsReport' />
}))
jest.mock('./pages/Reports/Switches', () => ({
  SwitchesReport: () => <div data-testid='switchesReport' />
}))

test('should redirect reports to reports/network/wireless', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkReport')).toBeTruthy()
})
test('should navigate to reports/applications', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports/applications',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('applicationsReport')).toBeTruthy()
})
test('should navigate to reports/aps', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports/aps',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('apsReport')).toBeTruthy()
})
test('should navigate to reports/switches', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports/switches',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('switchesReport')).toBeTruthy()
})
test('should navigate to reports/clients', async () => {
  render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/reports/clients',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('clientsReport')).toBeTruthy()
})
