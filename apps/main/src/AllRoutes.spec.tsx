import React from 'react'

import { CommonUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved, cleanup } from '@acx-ui/test-utils'
import { mockRestApiQuery }                                   from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('./App/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('analytics/Routes', () => () => {
  return <div data-testid='analytics' />
},{ virtual: true })
jest.mock('rc/Routes', () => () => {
  return (
    <>
      <div data-testid='networks' />
      <div data-testid='services' />
    </>
  )
},{ virtual: true })

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
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByTestId('analytics')
  })
  test('should navigate to networks/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/networks/some-page',
        wrapRoutes: false
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByTestId('networks')
  })
  test('should navigate to services/*', async () => {
    render(<Provider><AllRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/services/some-page',
        wrapRoutes: false
      }
    })

    await screen.findByTestId('services')
  })
})
