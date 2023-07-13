import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { Provider, serviceGuardApiURL }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import * as fixtures from './__tests__/fixtures'

import { useServiceGuard, ServiceGuard } from '.'

describe('Service Validation', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(serviceGuardApiURL, 'FetchAllServiceGuardSpecs',
      { data: fixtures.fetchAllServiceGuardSpecs })
  })
  it('should render page correctly', async () => {
    const Component = () => {
      const { component } = useServiceGuard()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(screen.queryByText('Service Validation')).toBeNull()
    expect(await screen.findByText('Test Name')).toBeVisible()
    expect(screen.queryByText('Create Test')).toBeNull()
  })
  it('should render title with count correctly', async () => {
    const Title = () => {
      const { title } = useServiceGuard()
      return <span>{title}</span>
    }
    render(<Title/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Service Validation (4)')).toBeVisible()
  })
  it('should render extra header correctly', async () => {
    const Component = () => {
      const { headerExtra } = useServiceGuard()
      return <span>{headerExtra}</span>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Create Test')).toBeVisible()
  })
  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<ServiceGuard/>, { wrapper: Provider, route: {} })
    expect(screen.queryByText('Service Validation')).toBeVisible()
    expect(await screen.findByText('Test Name')).toBeVisible()
    expect(await screen.findByText('Create Test')).toBeVisible()
  })
  it('should update tab count by context', async () => {
    const Component = () => {
      const { title, component } = useServiceGuard()
      return <>{title}{component}</>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Service Validation (4)')).toBeVisible()
    const input = await screen.findByPlaceholderText('Search Test Name')
    await userEvent.type(input, 'anything')
    expect(await screen.findByText('Service Validation (0)')).toBeVisible()
  })
})
