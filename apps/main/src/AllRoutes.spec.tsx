import React from 'react'

import { render, screen, waitForElementToBeRemoved, cleanup } from '@testing-library/react'
import { createMemoryHistory }                                from 'history'
import { Router }                                             from 'react-router-dom'

import { CommonUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { mockRestApiQuery } from '@acx-ui/test-utils'

import AllRoutes from './AllRoutes'

jest.mock('./App/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('analytics/Routes', () => () => {
  return <div data-testid='analytics' />
},{ virtual: true })
jest.mock('rc-wifi/Routes', () => () => {
  return <div data-testid='networks' />
},{ virtual: true })

describe('AllRoutes', () => {
  const history = createMemoryHistory()
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url.replace(':',''), 'http', 'get', {})
  })
  afterEach(cleanup)
  test('should navigate to dashboard', async () => {
    history.push('/t/tenantId/dashboard')
    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <AllRoutes />
        </Provider>
      </Router>
    )
    await screen.findByTestId('dashboard')
  })
  test('should navigate to analytics/*', async () => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url.replace(':',''), 'http', 'get', {})
    history.push('/t/tenantId/analytics/some-page')
    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <AllRoutes />
        </Provider>
      </Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByTestId('analytics')
  })
  test('should navigate to networks/*', async () => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url.replace(':',''), 'http', 'get', {})
    history.push('/t/tenantId/networks/some-page')
    render(
      <Router location={history.location} navigator={history}>
        <Provider>
          <AllRoutes />
        </Provider>
      </Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await screen.findByTestId('networks')
  })
})
