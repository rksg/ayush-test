import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import Clients, { AIClientsTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./ClientsList', () => ({
  ClientsList: () => <div>Client list content</div>
}))

describe('Clients', () => {
  it('should render clients list tab', async () => {
    render(<Clients tab={AIClientsTabEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Wireless')).toBeVisible()
    expect(await screen.findByText('Client list content')).toBeVisible()
    expect(await screen.findByText('Last 24 Hours')).toBeVisible()
  })
  it('should handle reports tab click', async () => {
    render(<Clients tab={AIClientsTabEnum.CLIENTS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Wireless Clients Reports'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/ai/users/wifi/reports', hash: '', search: ''
    })
  })
})