import '@testing-library/jest-dom'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { Provider, serviceGuardApiURL }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import * as fixtures from './__tests__/fixtures'

import { useServiceGuard } from '.'

jest.mock('./ServiceGuardTable', () => ({
  ...jest.requireActual('./ServiceGuardTable'),
  ServiceGuardTable: () => <div data-testid='ServiceGuardTable' />
}))

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
    render(<Component/>,{ wrapper: Provider, route: {} })
    expect(screen.queryByText('Service Validation')).toBeNull()
    expect(await screen.findByTestId('ServiceGuardTable')).toBeVisible()
    expect(screen.queryByText('Create Test')).toBeNull()
  })
  it('should render title with count correctly', async () => {
    const Title = () => {
      const { title } = useServiceGuard()
      return <span>{title}</span>
    }
    render(<Title/>,{ wrapper: Provider, route: {} })
    expect(await screen.findByText('Service Validation (4)')).toBeVisible()
  })
  it('should render extra header correctly', async () => {
    const Component = () => {
      const { headerExtra } = useServiceGuard()
      return <span>{headerExtra}</span>
    }
    render(<Component/>,{ wrapper: Provider, route: {} })
    expect(await screen.findByText('Create Test')).toBeVisible()
  })
  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const Component = () => {
      const { component } = useServiceGuard()
      return component
    }
    render(<Component/>,{ wrapper: Provider, route: {} })
    expect(screen.queryByText('Service Validation')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardTable')).toBeVisible()
    expect(await screen.findByText('Create Test')).toBeVisible()
  })
})
