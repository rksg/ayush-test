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

describe('ClientDetails', () => {
  const params = {
    clientId: 'mockClientId',
    activeTab: 'overview'
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
    expect(await screen.findByRole('tab', { name: 'Overview', selected: true })).toBeVisible()
    expect(await screen.findByText('Troubleshooting')).toBeVisible()
    expect(await screen.findByText('Reports')).toBeVisible()

    fireEvent.click(await screen.findByRole('tab', { name: 'Reports' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/users/wifi/clients/${params.clientId}/details/reports`,
      hash: '',
      search: ''
    })
  })

  it('should render with hostname', async () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('soyboy')
    render(<ClientDetails/>, {
      wrapper: Provider,
      route: {
        params: {
          ...params,
          activeTab: 'overview'
        },
        path: '/users/wifi/clients/:clientId/details/:activeTab'
      }
    })
    expect(await screen.findByText('soyboy')).toBeVisible()
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
