import { serviceGuardApiURL, Provider }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../../__tests__/fixtures'

import { Overview } from '.'

jest.mock('./ConfigSection', () => ({
  ...jest.requireActual('./ConfigSection'),
  ConfigSection: () => <div data-testid='ConfigSection' />
}))

jest.mock('./ExecutionSection', () => ({
  ...jest.requireActual('./ExecutionSection'),
  ExecutionSection: () => <div data-testid='ExecutionSection' />
}))

describe('Overview component', () => {
  it('should render correctly', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    render(<Overview/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(screen.queryByTestId('ConfigSection')).toBeVisible()
    expect(screen.queryByTestId('ExecutionSection')).toBeVisible()
  })
})
