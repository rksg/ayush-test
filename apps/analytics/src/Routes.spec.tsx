import { useIsSplitOn, useIsTierAllowed }                       from '@acx-ui/feature-toggle'
import { serviceGuardApiURL, Provider }                         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                                            from '@acx-ui/types'
import { getUserProfile, setUserProfile }                       from '@acx-ui/user'

import { fetchServiceGuardSpec, fetchServiceGuardTest } from './pages/ServiceGuard/__tests__/fixtures'
import AnalyticsRoutes                                  from './Routes'

jest.mock('./pages/ServiceGuard/ServiceGuardForm', () => ({
  default: () => <div data-testid='ServiceGuardForm' />,
  __esModule: true
}))

jest.mock('./pages/ServiceGuard/ServiceGuardDetails',() => ({
  default: () => <div data-testid='ServiceGuardDetails'/>,
  __esModule: true
}))

jest.mock('./pages/ServiceGuard', () => ({
  ServiceGuard: () => <div data-testid='ServiceGuardPage' />,
  useServiceGuard: () => ({
    component: <div data-testid='ServiceGuardPage' />
  })
}))

jest.mock('./pages/VideoCallQoe', () => ({
  VideoCallQoe: () => <div data-testid='VideoCallQoePage' />,
  useVideoCallQoe: () => ({
    component: <div data-testid='VideoCallQoePage' />
  })
}))

jest.mock('@acx-ui/analytics/components', () => ({
  HealthPage: () => <div data-testid='healthPage' />,
  IncidentDetails: () => <div data-testid='incidentDetails' />,
  IncidentListPage: () => <div data-testid='incidentListPage' />,
  IncidentListPageLegacy: () => <div data-testid='incidentListPageLegacy' />
}))

jest.mock('./pages/NetworkAssurance', () => ({
  ...jest.requireActual('./pages/NetworkAssurance'),
  NetworkAssurance: () => <div data-testid='networkAssurance' />
}))

jest.mock('./pages/AIAnalytics', () => ({
  ...jest.requireActual('./pages/AIAnalytics'),
  AIAnalytics: () => <div data-testid='aiAnalytics' />
}))

beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))

test('should redirect analytics to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentListPage')).toBeVisible()
})
test('should navigate to analytics/incidents page', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/incidents',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('incidentListPage')).toBeVisible()
})
test('should navigate to analytics/incidents tab', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/incidents',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('aiAnalytics')).toBeVisible()
})
test('should navigate to analytics/serviceValidation', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
})
test('should navigate to Service Validation add page', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/add',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('ServiceGuardForm')).toBeVisible()
})
test('should navigate to Service Validation edit page', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(serviceGuardApiURL, 'FetchServiceGuardSpec', { data: fetchServiceGuardSpec })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/specId/edit',
      wrapRoutes: false
    }
  })
  await waitFor(()=>{
    expect(screen.getByTestId('ServiceGuardForm')).toBeVisible()
  })
})
test('should navigate to analytics/serviceValidation by ServiceGuardSpecGuard', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    serviceGuardApiURL, 'FetchServiceGuardSpec', { data: { serviceGuardSpec: null } })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/specId/edit',
      wrapRoutes: false
    }
  })
  await waitFor(()=>{
    expect(screen.getByTestId('networkAssurance')).toBeVisible()
  })
  expect(screen.getByText('Service Validation test does not exist')).toBeVisible()

  const close = await screen.findByRole('img')
  fireEvent.click(close)
})
test('should navigate to analytics/recommendations', () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/recommendations',
      wrapRoutes: false
    }
  })
  expect(screen.getByText('Recommendations')).toBeVisible()
})
test('should navigate to analytics/health page', () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(false)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/health tab', () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
})
test('should navigate to analytics/health/tab/overview page', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(false)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/health/tab/overview tab', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health/tab/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
})
test('should navigate to analytics/configChange', () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/configChange',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('aiAnalytics')).toBeVisible()
})
test('should navigate to analytics/incidentDetails', async () => {
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/incidents/incidentId',
      wrapRoutes: false
    }
  })
  expect(await screen.findByTestId('incidentDetails')).toBeVisible()
})
test('should navigate to analytics/serviceValidation/tab/overview', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/1/tests/1/tab/overview',
      wrapRoutes: false
    }
  })
  await waitFor(()=>{
    expect(screen.getByTestId('ServiceGuardDetails')).toBeVisible()
  })
})
test('should navigate to analytics/serviceValidation/tab/details', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/1/tests/1/tab/details',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('ServiceGuardDetails')).toBeVisible()
})
test('should navigate to analytics/serviceValidation by ServiceGuardTestGuard', async () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  mockGraphqlQuery(
    serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/serviceValidation/1/tests/1/tab/overview',
      wrapRoutes: false
    }
  })
  await waitFor(()=>{
    expect(screen.getByTestId('networkAssurance')).toBeVisible()
  })
  expect(screen.getByText('Service Validation test does not exist')).toBeVisible()

  const close = await screen.findByRole('img')
  fireEvent.click(close)
})
test('should navigate to analytics/videoCallQoe', () => {
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/videoCallQoe',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
})

describe('RBAC', () => {
  beforeEach(() => setUserProfile({
    allowedOperations: [],
    profile: {
      ...getUserProfile().profile,
      roles: [RolesEnum.READ_ONLY]
    }
  }))
  it('non-admin no access to analytics', async () => {
    const { container } = render(<AnalyticsRoutes />, {
      wrapper: Provider,
      route: {
        path: '/tenantId/t/analytics',
        wrapRoutes: false
      }
    })

    expect(container).toBeEmptyDOMElement()
  })
  it('non-admin no access to service validation', async () => {
    const { container } = render(<AnalyticsRoutes />, {
      wrapper: Provider,
      route: {
        path: '/tenantId/t/analytics/serviceValidation',
        wrapRoutes: false
      }
    })

    expect(container).toBeEmptyDOMElement()
  })
})

describe('should handle when feature flag NAVBAR_ENHANCEMENT is off', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  test('should redirect analytics to analytics/incidents', async () => {
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('incidentListPageLegacy')).toBeVisible()
  })
  test('should navigate to analytics/incidents', async () => {
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('incidentListPageLegacy')).toBeVisible()
  })
  test('should navigate to analytics/serviceValidation', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/serviceValidation',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('ServiceGuardPage')).toBeVisible()
  })
  test('should navigate to analytics/serviceValidation by ServiceGuardSpecGuard', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardSpec', { data: { serviceGuardSpec: null } })
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/serviceValidation/specId/edit',
        wrapRoutes: false
      }
    })
    await waitFor(()=>{
      expect(screen.getByTestId('ServiceGuardPage')).toBeVisible()
    })
    expect(screen.getByText('Service Validation test does not exist')).toBeVisible()

    const close = await screen.findByRole('img')
    fireEvent.click(close)
  })
  test('should navigate to analytics/health page', () => {
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/health',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('healthPage')).toBeVisible()
  })
  test('should navigate to analytics/health/tab/overview tab', async () => {
    render(< Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/health/tab/overview',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('healthPage')).toBeVisible()
  })
  test('should navigate to analytics/incidents/tab/overview', async () => {
    render(< Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/incidents/tab/overview',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('incidentListPageLegacy')).toBeVisible()
  })
  test('should navigate to analytics/serviceValidation by ServiceGuardTestGuard', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest: null } })
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/serviceValidation/1/tests/1/tab/overview',
        wrapRoutes: false
      }
    })
    await waitFor(()=>{
      expect(screen.getByTestId('ServiceGuardPage')).toBeVisible()
    })
    expect(screen.getByText('Service Validation test does not exist')).toBeVisible()

    const close = await screen.findByRole('img')
    fireEvent.click(close)
  })
  test('should navigate to analytics/videoCallQoe', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValueOnce(false)
    jest.mocked(useIsSplitOn).mockReturnValueOnce(true)
    render(<Provider><AnalyticsRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/videoCallQoe',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('VideoCallQoePage')).toBeVisible()
  })
})
