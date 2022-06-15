import React from 'react'

import { render, screen }      from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router }              from 'react-router-dom'

import { Provider } from '@acx-ui/store'

import AllRoutes from './AllRoutes'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

jest.mock('./App/Dashboard', () => () => {
  return <div data-testid='dashboard' />
})
jest.mock('./App/Analytics', () => () => {
  return <div data-testid='analytics' />
})
jest.mock('./App/Networks', () => () => {
  return <div data-testid='networks' />
})

test('should navigate to dashboard', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/dashboard')
  render(
    <Router location={history.location} navigator={history}>
      <Provider>
        <AllRoutes />
      </Provider>
    </Router>
  )
  screen.getByTestId('dashboard')
})
test('should navigate to analytics', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics')
  render(
    <Router location={history.location} navigator={history}>
      <Provider>
        <AllRoutes />
      </Provider>
    </Router>
  )
  screen.getByTestId('analytics')
})
test('should navigate to networks', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/networks')
  render(
    <Router location={history.location} navigator={history}>
      <Provider>
        <AllRoutes />
      </Provider>
    </Router>
  )
  screen.getByTestId('networks')
})
