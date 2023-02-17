import { networkHealthApiURL }                                     from '@acx-ui/analytics/services'
import { Provider }                                                from '@acx-ui/store'
import { fireEvent, mockGraphqlMutation, render, screen, waitFor } from '@acx-ui/test-utils'

import { runServiceGuardTest } from '../../__tests__/fixtures'

import { ReRunButton } from './ReRunTestButton'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ReRunButton', () => {
  it('should render', async () => {
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })
    const button = await screen.findByText('Re-Run Test')
    expect(button).toBeVisible()

    fireEvent.click(button)
    await waitFor(async () =>
      expect(await screen.findByText('Network Health test run created')).toBeVisible())

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/t/t-id/serviceValidation/networkHealth/spec-id/tests/3',
      hash: '',
      search: ''
    })
  })
  it('should show error when test run failed', async () => {
    const runServiceGuardTest = {
      runServiceGuardTest: {
        spec: null,
        userErrors: [{ field: 'id', message: 'SPEC_NOT_FOUND' }]
      }
    }
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })
    const button = await screen.findByText('Re-Run Test')
    expect(button).toBeVisible()

    fireEvent.click(button)
    await waitFor(async () =>
      expect(await screen.findByText('Network Health test does not exist')).toBeVisible())
  })
})
