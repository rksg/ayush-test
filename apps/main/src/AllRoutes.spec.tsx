import React from 'react'

import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'


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
  useUserProfileContext: () => ({
    data: { companyName: 'Mock company' }
  })
}))
jest.mock('./pages/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('analytics/Routes', () => () => {
  return <div data-testid='analytics' />
}, { virtual: true })
jest.mock('reports/Routes', () => () => {
  return <div data-testid='reports' />
}, { virtual: true })
jest.mock('rc/Routes', () => () => {
  return (
    <>
      <div data-testid='devices' />
      <div data-testid='networks' />
      <div data-testid='services' />
      <div data-testid='policies' />
    </>
  )
},{ virtual: true })
jest.mock('./pages/Venues/VenuesTable', () => ({
  VenuesTable: () => {
    return <div data-testid='venues' />
  }
}), { virtual: true })
jest.mock('msp/Routes', () => () => {
  return <div data-testid='msp' />
}, { virtual: true })
jest.mock('@acx-ui/msp/components', () => ({
  ...jest.requireActual('@acx-ui/msp/components'),
  MFASetupModal: () => {
    return <div data-testid='mfaSetup' />
  }
}), { virtual: true })
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

describe('AllRoutes', () => {
  afterEach(cleanup)
  test('should navigate to dashboard', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/dashboard',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('dashboard')
  })
  test('should navigate to analytics/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/analytics/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('analytics')
  })
  test('should navigate to reports/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/reports/network/wireless',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('reports')
  })

  test('should navigate to devices/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/devices/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('devices')
  })

  test('should navigate to networks/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks/some-page',
        wrapRoutes: false
      }
    })
    await screen.findByTestId('networks')
  })

  test('should navigate to services/* if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/services/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('services')).toBeInTheDocument()
  })

  test('should not navigate to services/* if the feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/services/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('Services is not enabled')).toBeInTheDocument()
  })

  test('should navigate to policies/* if the feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/policies/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('policies')).toBeInTheDocument()
  })

  test('should not navigate to policies/* if the feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/policies/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByText('Policies is not enabled')).toBeInTheDocument()
  })

  test('should navigate to venues/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/venues'
      }
    })
    await screen.findByTestId('venues')
  })

  test('should navigate to msp pages', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/v/tenantId/dashboard'
      }
    })
    expect(await screen.findByTestId('msp')).toBeVisible()
  })
})