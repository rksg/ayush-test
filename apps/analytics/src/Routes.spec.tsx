import { render, screen }      from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router }              from 'react-router-dom'

import AnalyticsRoutes from './Routes'

test('should navigate to analytics/incidents', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics/incidents')
  render(
    <Router location={history.location} navigator={history}>
      <AnalyticsRoutes />
    </Router>
  )
  screen.getByText('Incidents')
})
test('should navigate to analytics/recommendations', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics/recommendations')
  render(
    <Router location={history.location} navigator={history}>
      <AnalyticsRoutes />
    </Router>
  )
  screen.getByText('Recommendations')
})
test('should navigate to analytics/health', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics/health')
  render(
    <Router location={history.location} navigator={history}>
      <AnalyticsRoutes />
    </Router>
  )
  screen.getByText('Health')
})
test('should navigate to analytics/configChange', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics/configChange')
  render(
    <Router location={history.location} navigator={history}>
      <AnalyticsRoutes />
    </Router>
  )
  screen.getByText('Config Change')
})
test('should navigate to analytics/occupancy', () => {
  const history = createMemoryHistory()
  history.push('/t/tenantId/analytics/occupancy')
  render(
    <Router location={history.location} navigator={history}>
      <AnalyticsRoutes />
    </Router>
  )
  screen.getByText('Occupancy')
})
