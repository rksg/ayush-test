import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { AIAnalytics, AIAnalyticsTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  IncidentTabContent: () => <div data-testid='Incidents' />,
  useHeaderExtra: () => [ <div data-testid='HeaderExtra' /> ]
}))

jest.mock('../ConfigChange', () => ({
  ...jest.requireActual('../ConfigChange'),
  ConfigChange: () => <div data-testid='ConfigChange' />
}))

describe('NetworkAssurance', () => {
  it('should render incidents', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('Incidents')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should render config change', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.CONFIG_CHANGE}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('AI Analytics')).toBeVisible()
    expect(await screen.findByTestId('ConfigChange')).toBeVisible()
    expect(await screen.findByTestId('HeaderExtra')).toBeVisible()
  })
  it('should handle tab click', async () => {
    render(<AIAnalytics tab={AIAnalyticsTabEnum.INCIDENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    userEvent.click(await screen.findByText('Config Change'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/configChange', hash: '', search: ''
    }))
  })
})