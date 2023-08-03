import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }      from '@acx-ui/feature-toggle'
import { Provider }                            from '@acx-ui/store'
import { render, screen, cleanup, mockServer } from '@acx-ui/test-utils'
import { RolesEnum }                           from '@acx-ui/types'
import { getUserProfile, setUserProfile }      from '@acx-ui/user'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useStreamActivityMessagesQuery: jest.fn(),
  useGetMspEcProfileQuery: () => ({ data: {
    msp_label: '',
    name: '',
    service_effective_date: '',
    service_expiration_date: '',
    is_active: 'false'
  } }),
  useGetPreferencesQuery: () => ({ data: {} })
}))
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  LicenseBanner: () => <div data-testid='license-banner' />,
  ActivityButton: () => <div data-testid='activity-button' />,
  AlarmsButton: () => <div data-testid='alarms-button' />,
  HelpButton: () => <div data-testid='help-button' />,
  UserButton: () => <div data-testid='user-button' />,
  FetchBot: () => <div data-testid='fetch-bot' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  CloudMessageBanner: () => <div data-testid='cloud-message-banner' />,
  useUpdateGoogleMapRegion: () => { return { update: jest.fn() }}
}))
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { companyName: 'Mock company' } })
}))
jest.mock('./pages/Dashboardv2', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('./routes/AnalyticsRoutes', () => () => {
  return <div data-testid='analytics' />
}, { virtual: true })
jest.mock('@reports/Routes', () => () => {
  return <div data-testid='reports' />
}, { virtual: true })

jest.mock('@rc/Routes', () => () => {
  return (
    <>
      <div data-testid='devices' />
      <div data-testid='networks' />
      <div data-testid='services' />
      <div data-testid='policies' />
      <div data-testid='users' />
      <div data-testid='timeline' />
    </>
  )
},{ virtual: true })
jest.mock('./pages/Venues/VenuesTable', () => ({
  VenuesTable: () => {
    return <div data-testid='venues' />
  }
}), { virtual: true })
jest.mock('@msp/Routes', () => () => {
  return <div data-testid='msp' />
}, { virtual: true })
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

describe('AllRoutes', () => {
  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
    //FIXME: Workaround ACX-37479
    mockServer.use(
      rest.get('mspCustomers/', (req, res, ctx) => {
        return res(ctx.json({}))
      })
    )
  })

  afterEach(cleanup)
  test('should navigate to dashboard', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/dashboard',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('dashboard')
  })
  test('should navigate to analytics/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/analytics/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('analytics')
  })
  test('should navigate to reports/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/reports/network/wireless',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('reports')
  })
  test('should navigate to dataStudio', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/dataStudio',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('reports')
  })

  test('should navigate to devices/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/devices/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('devices')
  })

  test('should navigate to networks/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/networks/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('networks')
  })

  test('should navigate to services/* if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/services/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('services')).toBeInTheDocument()
  })

  test('should not navigate to services/* if the feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/services/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('Services is not enabled')).toBeInTheDocument()
  })

  test('should navigate to policies/* if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/policies/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('policies')).toBeInTheDocument()
  })

  test('should not navigate to policies/* if the feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/policies/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('Policies is not enabled')).toBeInTheDocument()
  })

  test('should navigate to venues/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/venues'
      }
    })
    await screen.findByTestId('venues')
  })

  test('should navigate to msp pages', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/v/dashboard'
      }
    })
    expect(await screen.findByTestId('msp')).toBeVisible()
  })
  test('should navigate to users/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/users/some-page'
      }
    })
    await screen.findByTestId('users')
  })
  test('should navigate to timeline/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/timeline/some-page'
      }
    })
    await screen.findByTestId('timeline')
  })

  test('should not see anayltics & service validation if not admin', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const { rerender } = render(<AllRoutes />, {
      wrapper: Provider,
      route: {
        path: '/tenantId/t/dashboard'
      }
    })

    const menuItem = await screen.findByRole('menuitem', { name: 'AI Assurance' })
    expect(menuItem).toBeVisible()

    setUserProfile({
      allowedOperations: [],
      profile: {
        ...getUserProfile().profile,
        roles: [RolesEnum.READ_ONLY]
      }
    })

    rerender(<AllRoutes />)

    await screen.findAllByRole('menuitem')

    expect(menuItem).not.toBeInTheDocument()
  })
})
