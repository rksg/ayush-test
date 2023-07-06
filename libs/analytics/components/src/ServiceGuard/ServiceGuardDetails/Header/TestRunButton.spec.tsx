import userEvent from '@testing-library/user-event'

import { serviceGuardApiURL, Provider }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardRelatedTests } from '../../__tests__/fixtures'

import { TestRunButton } from './TestRunButton'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('ReRunButton', () => {
  it('should render', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardRelatedTests', { data: fetchServiceGuardRelatedTests })
    render(<TestRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })

    expect(await screen.findByText('02/14/2023 00:00:00')).toBeVisible()

    await userEvent.click(await screen.findByText('Test Time'))
    expect(screen.getByText('02/15/2023 00:00:00')).toBeTruthy()
  })
  it('should handle when no test data', async () => {
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardRelatedTests', { data: { serviceGuardTest: null } })
    render(<TestRunButton/>, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id', testId: '1' } }
    })
    expect(await screen.findByText('--')).toBeVisible()
  })
})
