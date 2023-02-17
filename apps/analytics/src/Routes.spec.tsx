import { networkHealthApiURL }                                                         from '@acx-ui/analytics/services'
import { useIsTierAllowed }                                                            from '@acx-ui/feature-toggle'
import { Provider }                                                                    from '@acx-ui/store'
import { act, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'

import { fetchServiceGuardSpec, fetchServiceGuardTest } from './pages/NetworkHealth/__tests__/fixtures'
import AnalyticsRoutes                                  from './Routes'

jest.mock('./pages/NetworkHealth/NetworkHealthForm', () => ({
  default: () => <div data-testid='NetworkHealthForm' />,
  __esModule: true
}))

jest.mock('./pages/NetworkHealth/NetworkHealthDetails',() => ({
  default: () => <div data-testid='NetworkHealthDetails'/>,
  __esModule: true
}))

jest.mock('./pages/NetworkHealth/NetworkHealthList', () => ({
  default: () => <div data-testid='NetworkHealthPage' />,
  __esModule: true
}))

jest.mock('@acx-ui/analytics/components', () => ({
  HealthPage: () => <div data-testid='healthPage' />,
  IncidentListPage: () => <div data-testid='incidentsListPage' />
}))

jest.mock('./pages/IncidentDetails', () => () => {
  return <div data-testid='incidentDetails' />
})

test('should redirect analytics to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should redirect service validation to serviceValidation/networkHealth', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
})
test('should navigate to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
})
test('should navigate to Netework Health add page', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/add',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthForm')).toBeVisible()
})
test('should navigate to Netework Health edit page', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(networkHealthApiURL, 'FetchServiceGuardSpec', { data: fetchServiceGuardSpec })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/specId/edit',
      wrapRoutes: false
    }
  })
  await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  expect(screen.getByTestId('NetworkHealthForm')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth by NetworkHealthSpecGuard', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    networkHealthApiURL, 'FetchServiceGuardSpec', { data: { serviceGuardSpec: null } })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/specId/edit',
      wrapRoutes: false
    }
  })
  await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 100)) })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
  expect(screen.getByText('Network Health test does not exist')).toBeVisible()

  const close = await screen.findByRole('img')
  fireEvent.click(close)
})
test('should navigate to analytics/recommendations', () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/recommendations',
      wrapRoutes: false
    }
  })
  expect(screen.getByText('Recommendations')).toBeVisible()
})
test('should navigate to analytics/health', () => {
  render(<AnalyticsRoutes />, {
    route: {
      path: '/t/tenantId/analytics/health',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/health/tab/overview', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/health/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/configChange', () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/configChange',
      wrapRoutes: false
    }
  })
  expect(screen.getByText('Config Change')).toBeVisible()
})
test('should navigate to analytics/incidentDetails', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents/incidentId',
      wrapRoutes: false
    }
  })
  expect(await screen.findByTestId('incidentDetails')).toBeVisible()
})
test('should navigate to analytics/incidents/tab/overview', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/analytics/incidents/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentsListPage')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth/tab/overview', async () => {
  mockGraphqlQuery(
    networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/1/tests/1/tab/overview',
      wrapRoutes: false
    }
  })
  await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  expect(screen.getByTestId('NetworkHealthDetails')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth/tab/details', async () => {
  mockGraphqlQuery(
    networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/1/tests/1/tab/details',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('NetworkHealthDetails')).toBeVisible()
})
test('should navigate to serviceValidation/networkHealth by NetworkHealthTestGuard', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/serviceValidation/networkHealth/1/tests/1/tab/overview',
      wrapRoutes: false
    }
  })
  await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 100)) })
  expect(screen.getByTestId('NetworkHealthPage')).toBeVisible()
  expect(screen.getByText('Network Health test does not exist')).toBeVisible()
})

describe('if tier no access', () => {
  // eslint-disable-next-line no-console
  afterAll(() => jest.mocked(console.warn).mockRestore())

  it('service validation renders nothing', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<AnalyticsRoutes />, {
      route: {
        path: '/t/tenantId/serviceValidation',
        wrapRoutes: false
      },
      wrapper: Provider
    })
    expect(container).toBeEmptyDOMElement()
  })
})
