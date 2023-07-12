import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ServiceGuardDetails } from '.'

const params = { tenantId: 'tenant-id', specId: 'spec-id', testId: 'test-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./Header', () => ({
  ...jest.requireActual('./Header'),
  Title: () => <div data-testid='ServiceGuardDetails-Title' />,
  SubTitle: () => <div data-testid='ServiceGuardDetails-SubTitle' />,
  ReRunButton: () => <div data-testid='ServiceGuardDetails-ReRunButton' />,
  TestRunButton: () => <div data-testid='ServiceGuardDetails-TestRunButton' />
}))

jest.mock('./Overview', () => ({
  ...jest.requireActual('./Overview'),
  Overview: () => <div data-testid='ServiceGuardDetails-Overview' />
}))

describe('Service Validation', () => {
  beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
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
    expect(await screen.findByTestId('ServiceGuardDetails-SubTitle')).toBeVisible()
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

  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <ServiceGuardDetails />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findByText('Service Validation')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Title')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-SubTitle')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-ReRunButton')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-TestRunButton')).toBeVisible()
    expect(await screen.findByTestId('ServiceGuardDetails-Overview')).toBeVisible()
  })
})
