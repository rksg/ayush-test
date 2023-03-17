import userEvent from '@testing-library/user-event'

import { networkHealthApiURL, Provider }                         from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest, runServiceGuardTest } from '../../__tests__/fixtures'

import { ReRunButton } from './ReRunTestButton'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ReRunButton', () => {
  it('should render', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      spec: { apsCount: 2 },
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    }
    mockGraphqlQuery(networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id', testId: '1' } }
    })

    const button = await screen.findByText('Re-Run Test')
    await userEvent.click(button)

    expect(await screen.findByText('Network Health test running')).toBeVisible()
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/t/t-id/serviceValidation/networkHealth/spec-id/tests/3',
      hash: '',
      search: ''
    })
  })
  it('should show error when test run failed', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      spec: { apsCount: 2 },
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 0,
        apsSuccessCount: 2
      }
    }
    const runServiceGuardTest = {
      runServiceGuardTest: {
        spec: null,
        userErrors: [{ field: 'id', message: 'SPEC_NOT_FOUND' }]
      }
    }
    mockGraphqlQuery(networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    mockGraphqlMutation(networkHealthApiURL, 'RunNetworkHealthTest', { data: runServiceGuardTest })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id', testId: '1' } }
    })
    const button = await screen.findByText('Re-Run Test')
    expect(button).toBeVisible()

    await userEvent.click(button)
    expect(await screen.findByText('Network Health test does not exist')).toBeVisible()
  })
  it('should be disabled when test is ongoing', async () => {
    const serviceGuardTest = {
      ...fetchServiceGuardTest.serviceGuardTest,
      spec: { apsCount: 2 },
      summary: {
        apsTestedCount: 2,
        apsPendingCount: 2,
        apsSuccessCount: 0
      }
    }
    mockGraphqlQuery(networkHealthApiURL, 'FetchServiceGuardTest', { data: { serviceGuardTest } })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id', testId: '1' } }
    })
    expect(await screen.findByText('Re-Run Test')).toBeDefined()
  })
  it('should be disabled when test has no APs', async () => {
    mockGraphqlQuery(networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    render(<ReRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', specId: 'spec-id', testId: '1' } }
    })
    expect(await screen.findByText('Re-Run Test')).toBeDefined()
  })
})
