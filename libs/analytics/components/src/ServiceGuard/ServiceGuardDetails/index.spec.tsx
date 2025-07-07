import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { serviceGuardApiURL, Provider }     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                        from '@acx-ui/types'
import { getUserProfile, setUserProfile }   from '@acx-ui/user'

import { fetchServiceGuardTest } from '../__tests__/fixtures'

import { ServiceGuardDetails } from '.'

const params = { tenantId: 'tenant-id', specId: 'spec-id', testId: 'test-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./Header', () => ({
  ...jest.requireActual('./Header'),
  Title: () => <div data-testid='ServiceGuardDetails-Title' />,
  ReRunButton: () => <div data-testid='ServiceGuardDetails-ReRunButton' />,
  TestRunButton: () => <div data-testid='ServiceGuardDetails-TestRunButton' />
}))

jest.mock('./Overview', () => ({
  ...jest.requireActual('./Overview'),
  Overview: () => <div data-testid='ServiceGuardDetails-Overview' />
}))

describe('Service Validation', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(
      serviceGuardApiURL, 'FetchServiceGuardTest', { data: fetchServiceGuardTest })
  })
  it('should render page correctly', async () => {
    render(
      <Provider>
        <ServiceGuardDetails />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByText('Service Validation')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Title')).toBeVisible()
    expect(await screen.findByText('APs Under Test: 1')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-ReRunButton')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-TestRunButton')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Overview')).toBeVisible()
  })

  it('should change to details tab correctly', async () => {
    render(
      <Provider>
        <ServiceGuardDetails />
      </Provider>,
      { route: { params } }
    )
    await userEvent.click(screen.getByText('Details'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/analytics/serviceValidation/spec-id/tests/test-id/tab/details`,
      hash: '',
      search: ''
    })
  })

  it('should hide re-run button when role = READ_ONLY', async () => {
    const profile = getUserProfile()
    setUserProfile({ ...profile, profile: {
      ...profile.profile, roles: [RolesEnum.READ_ONLY]
    } })
    render(
      <Provider>
        <ServiceGuardDetails />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByText('Service Validation')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Title')).toBeVisible()
    expect(await screen.findByText('APs Under Test: 1')).toBeVisible()
    expect(screen.queryByTestId('ServiceGuardDetails-ReRunButton')).not.toBeInTheDocument()
    expect(await screen.findByTestId('ServiceGuardDetails-TestRunButton')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Overview')).toBeVisible()
  })
})
