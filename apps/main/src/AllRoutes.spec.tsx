import { rest } from 'msw'

import { useIsSplitOn, useIsTierAllowed }                              from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                 from '@acx-ui/msp/utils'
import { Provider }                                                    from '@acx-ui/store'
import { render, screen, cleanup, mockServer }                         from '@acx-ui/test-utils'
import { RolesEnum }                                                   from '@acx-ui/types'
import { getUserProfile, MFAStatus, setUserProfile, UserRbacUrlsInfo } from '@acx-ui/user'

import AllRoutes from './AllRoutes'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useStreamActivityMessagesQuery: jest.fn(),
  useGetPreferencesQuery: () => ({ data: {} }),
  useGetTenantDetailsQuery: () => ({ data: {} })
}))
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services'),
  useStreamActivityMessagesQuery: jest.fn(),
  useGetMspEcProfileQuery: () => ({ data: {
    msp_label: '',
    name: '',
    service_effective_date: '',
    service_expiration_date: '',
    is_active: 'false'
  } }),
  useGetBrandingDataQuery: () => ({ data: {
    msp_label: '',
    name: ''
  } })
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
  useUpdateGoogleMapRegion: () => { return { update: jest.fn() }},
  useIsEdgeReady: jest.fn().mockReturnValue(false),
  SpaceWrapper: () => <div data-testid='space-wrapper' />
}))
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: () => ({ data: { companyName: 'Mock company' } })
}))
jest.mock('./pages/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('./pages/AICanvas/archived/AICanvasQ1', () => () => {
  return <div data-testid='canvas' />
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
jest.mock('./pages/Venues', () => ({
  ...jest.requireActual('./pages/Venues'),
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
jest.mock('./pages/RWG/RWGTable', () => ({
  RWGTable: () => {
    return <div data-testid='ruckus-wan-gateway' />
  }
}), { virtual: true })

describe('AllRoutes', () => {
  beforeEach(() => {
    global.window.innerWidth = 1920
    global.window.innerHeight = 1080
    //FIXME: Workaround ACX-37479
    mockServer.use(
      rest.get('mspCustomers/', (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.post(
        MspUrlsInfo.getVarDelegations.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.get(
        UserRbacUrlsInfo.getMfaTenantDetails.url,
        (_req, res, ctx) => res(ctx.json({
          tenantStatus: MFAStatus.DISABLED,
          mfaMethods: [],
          userId: 'userId',
          enabled: false
        }))
      )
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
  test('should navigate to dataConnector', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/dataConnector',
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

  test('should navigate to canvas if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/canvas',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('canvas')).toBeInTheDocument()
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

  test('should not see AI Assurance if guest manager', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const { rerender } = render(<AllRoutes />, {
      wrapper: Provider,
      route: {
        path: '/tenantId/t/dashboard'
      }
    })
    expect(await screen.findByRole('menuitem', { name: 'AI Assurance' })).toBeVisible()

    setUserProfile({
      allowedOperations: [],
      profile: {
        ...getUserProfile().profile,
        roles: [RolesEnum.GUEST_MANAGER]
      },
      accountTier: 'Gold',
      betaEnabled: false
    })
    rerender(<AllRoutes />)
    expect(screen.queryByRole('menuitem', { name: 'AI Assurance' })).not.toBeInTheDocument()
  })

  test('should not see AI Assurance if DPSK admin', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const { rerender } = render(<AllRoutes />, {
      wrapper: Provider,
      route: {
        path: '/tenantId/t/dashboard'
      }
    })
    expect(await screen.findByRole('menuitem', { name: 'AI Assurance' })).toBeVisible()

    setUserProfile({
      allowedOperations: [],
      profile: {
        ...getUserProfile().profile,
        roles: [RolesEnum.DPSK_ADMIN]
      },
      accountTier: 'Gold',
      betaEnabled: false
    })
    rerender(<AllRoutes />)
    expect(screen.queryByRole('menuitem', { name: 'AI Assurance' })).not.toBeInTheDocument()
  })

  test('should navigate to ruckus-wan-gateway/*', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/tenantId/t/ruckus-wan-gateway'
      }
    })
    expect(await screen.findByTestId('ruckus-wan-gateway')).toBeInTheDocument()
  })
})
