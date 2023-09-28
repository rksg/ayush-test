import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import ClientDetails from '.'

jest.mock('@acx-ui/config', () => ({
  ...jest.requireActual('@acx-ui/config'),
  get: () => true
}))

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./ClientTroubleshooting', () => ({
  ClientTroubleshootingTab: () => <div data-testid='troubleshooting'></div>
}))

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='report'></div>
}))

describe('ClientDetails', () => {
  const params = {
    clientId: 'mockClientId',
    activeTab: 'reports'
  }

  it('should render correctly', async () => {
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params,
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByText(params.clientId)).toBeVisible()
    expect(await screen.findByText('Troubleshooting')).toBeVisible()
    expect(await screen.findByText('Reports')).toBeVisible()
    fireEvent.click(await screen.findByRole('tab', { name: 'Troubleshooting' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/users/wifi/clients/${params.clientId}/details/troubleshooting`,
      hash: '',
      search: ''
    })
  })

  it('should render with reports correctly', async () => {
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'reports'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Reports', selected: true })).toBeVisible()
  })

  it('should render client troubleshooting correctly', async () => {
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'troubleshooting'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByRole('tab', { name: 'Troubleshooting', selected: true }))
      .toBeVisible()
    expect(await screen.findByTestId('troubleshooting')).toBeVisible()
  })
})
