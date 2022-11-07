import React from 'react'

import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { CommonUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'
import { mockRestApiQuery }        from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('./pages/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('analytics/Routes', () => () => {
  return <div data-testid='analytics' />
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

describe('AllRoutes', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {})
  })
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
    jest.mocked(useSplitTreatment).mockReturnValue(true)

    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/policies/some-page',
        wrapRoutes: false
      }
    })

    expect(await screen.findByTestId('policies')).toBeInTheDocument()
  })

  test('should not navigate to policies/* if the feature flag is off', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(false)

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
