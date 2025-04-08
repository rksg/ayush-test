import {
  Band,
  ClientType,
  TestType,
  NetworkPaths,
  stages
} from '@acx-ui/analytics/components'
import { useIsSplitOn, useIsTierAllowed }                       from '@acx-ui/feature-toggle'
import { serviceGuardApiURL, Provider }                         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                                            from '@acx-ui/types'
import { getUserProfile, setUserProfile }                       from '@acx-ui/user'

import AnalyticsRoutes from './AnalyticsRoutes'

export const fetchServiceGuardSpec = {
  serviceGuardSpec: {
    id: 'spec-id',
    clientType: ClientType.VirtualWirelessClient,
    type: TestType.OnDemand,
    name: 'Test Name',
    configs: [{
      authenticationMethod: 'WPA3_PERSONAL',
      dnsServer: '10.10.10.10',
      pingAddress: '10.10.10.10',
      radio: Band.Band6,
      tracerouteAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      wlanPassword: '12345',
      wlanUsername: 'user',
      networkPaths: {
        networkNodes: [[
          { type: 'zone', name: 'VENUE' },
          { type: 'apMac', list: ['00:00:00:00:00:00'] }
        ]] as NetworkPaths
      }
    }]
  }
}

export const fetchServiceGuardTest = {
  serviceGuardTest: {
    id: 1,
    createdAt: '2023-02-03T11:00:00.000Z',
    previousTest: null,
    spec: {
      id: 'specId',
      name: 'name',
      type: 'on-demand',
      clientType: 'virtual-client',
      apsCount: 0
    },
    config: {
      authenticationMethod: 'WPA2_PERSONAL',
      radio: '2.4',
      speedTestEnabled: true,
      tracerouteAddress: 'google.com',
      pingAddress: 'google.com',
      dnsServer: '1.1.1.1',
      wlanName: 'Wifi Name',
      wlanUsername: 'my-user-name'
    },
    summary: {
      apsErrorCount: 0,
      apsFailureCount: 0,
      apsPendingCount: 0,
      apsSuccessCount: 2,
      apsTestedCount: 1,
      ...Object.keys(stages).reduce((acc, stage) => ({
        ...acc,
        [`${stage}Error`]: 0,
        [`${stage}Failure`]: 0,
        [`${stage}NA`]: 0,
        [`${stage}Pending`]: 0,
        [`${stage}Success`]: 2
      }), {})
    },
    wlanAuthSettings: {
      wpaVersion: 'WPA2'
    }
  }
}

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  AIAnalytics: () => <div data-testid='aiAnalytics' />,
  HealthPage: () => <div data-testid='healthPage' />,
  HealthPageWithTabs: () => <div data-testid='healthPageWithTabs' />,
  IncidentDetails: () => <div data-testid='incidentDetails' />,
  VideoCallQoe: () => <div data-testid='VideoCallQoePage' />,
  useVideoCallQoe: () => ({
    component: <div data-testid='VideoCallQoePage' />
  }),
  ServiceGuard: () => <div data-testid='ServiceGuardPage' />,
  useServiceGuard: () => ({
    component: <div data-testid='ServiceGuardPage' />
  }),
  NetworkAssurance: () => <div data-testid='networkAssurance' />,
  ServiceGuardForm: () => <div data-testid='ServiceGuardForm' />,
  ServiceGuardDetails: () => <div data-testid='ServiceGuardDetails'/>,
  RecommendationDetails: () => <div data-testid='RecommendationDetails'/>,
  CrrmDetails: () => <div data-testid='CrrmDetails'/>,
  IntentAIForm: () => <div data-testid='IntentAIForm'/>,
  IntentAIDetails: () => <div data-testid='IntentAIDetails'/>,
  UnknownDetails: () => <div data-testid='UnknownDetails'/>
}))

beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))

test('should redirect analytics to analytics/incidents', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('aiAnalytics')).toBeVisible()
})
test('should navigate to analytics/incidents page', async () => {
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/incidents',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('aiAnalytics')).toBeVisible()
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
test('should navigate to analytics/health page', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(false)
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
  jest.mocked(useIsSplitOn).mockReturnValue(false)
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(<Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
})
test('should navigate to analytics/health/overview overview page', async () => {
  jest.mocked(useIsSplitOn).mockReturnValue(false)
  jest.mocked(useIsTierAllowed).mockReturnValue(false)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getByTestId('healthPage')).toBeVisible()
})
test('should navigate to analytics/health/overview/tab/overview tab', async () => {
  jest.mocked(useIsSplitOn).mockReturnValue(false)
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  render(< Provider><AnalyticsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/analytics/health/overview/tab/overview',
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
  expect(screen.getByTestId('networkAssurance')).toBeVisible()
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

test('allow access to analytics for READ_ONLY', () => {
  const profile = getUserProfile()
  setUserProfile({ ...profile, profile: {
    ...profile.profile, roles: [RolesEnum.READ_ONLY]
  } })
  const { container } = render(<AnalyticsRoutes />, {
    wrapper: Provider,
    route: {
      path: '/tenantId/t/analytics',
      wrapRoutes: false
    }
  })
  expect(container).not.toBeEmptyDOMElement()
})

describe('RBAC', () => {
  beforeEach(() => setUserProfile({
    allowedOperations: [],
    profile: {
      ...getUserProfile().profile,
      roles: [RolesEnum.GUEST_MANAGER]
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
