import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { networkHealthApiURL }              from '@acx-ui/analytics/services'
import { Provider }                         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { fetchServiceGuardTest } from '../__tests__/fixtures'

import NetworkHealthDetails from '.'

const params = { tenantId: 'tenant-id', specId: 'spec-id', testId: 'test-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./Header', () => ({
  ...jest.requireActual('./Header'),
  Title: () => <div data-testid='NetworkHealthDetails-Title' />,
  SubTitle: () => <div data-testid='NetworkHealthDetails-SubTitle' />,
  ReRunButton: () => <div data-testid='NetworkHealthDetails-ReRunButton' />,
  TestRunButton: () => <div data-testid='NetworkHealthDetails-TestRunButton' />
}))

jest.mock('./Overview', () => ({
  ...jest.requireActual('./Overview'),
  Overview: () => <div data-testid='NetworkHealthDetails-Overview' />
}))

beforeEach(() => mockGraphqlQuery(
  networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest }))

describe('Network Health', () => {
  it('should render page correctly', async () => {
    render(
      <Provider>
        <NetworkHealthDetails />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Network Health')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthDetails-Title')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthDetails-SubTitle')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthDetails-ReRunButton')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthDetails-TestRunButton')).toBeVisible()
    expect(await screen.findByTestId('NetworkHealthDetails-Overview')).toBeVisible()
  })

  it('should change to details tab correctly', async () => {
    mockGraphqlQuery(
      networkHealthApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
    render(
      <Provider>
        <NetworkHealthDetails />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByText('Details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/serviceValidation/networkHealth/spec-id/tests/test-id/tab/details`,
      hash: '',
      search: ''
    })
  })
})
