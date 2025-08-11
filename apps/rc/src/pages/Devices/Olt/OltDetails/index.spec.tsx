import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { OltDetails } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./OltOverviewTab', () => ({
  OltOverviewTab: () => <div data-testid={'OltOverviewTab'} />
}))
jest.mock('./OltNetworkCardTab', () => ({
  OltNetworkCardTab: () => <div data-testid={'OltNetworkCardTab'} />
}))
jest.mock('./OltLineCardTab', () => ({
  OltLineCardTab: () => <div data-testid={'OltLineCardTab'} />
}))
jest.mock('./OltDetailsDrawer', () => ({
  OltDetailsDrawer: () => <div data-testid={'OltDetailsDrawer'} />
}))

describe('OltDetails', () => { //TODO
  const params = { tenantId: 'tenant-id', oltId: 'olt-id', activeTab: 'overview' }
  it('should render correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params: { ...params, activeTab: 'unexisting-tab' } }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByTestId('OltOverviewTab')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/Network Card/))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/olt-id/details/network',
      search: '',
      hash: ''
    })
  })

  it('should render details drawer correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/Device Details/))
    expect(screen.getByTestId('OltDetailsDrawer')).toBeInTheDocument()
  })

  it('should navigate to config page correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Configure/ }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/olt-id/edit',
      search: '',
      hash: ''
    }, {
      state: {
        from: expect.any(Object)
      }
    })
  })

  it('should sync data correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Sync Data/))
    expect(
      screen.getByRole('menuitem', { name: 'Sync Data' }).getAttribute('aria-disabled')
    ).toBe('true')
  })

  it('should reboot olt correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Reboot OLT/))
    expect(screen.getByText('Reboot OLT')).toBeInTheDocument()
  })

  it('should delete olt correctly', async () => {
    render(<Provider>
      <OltDetails />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Delete OLT/))
    expect(screen.getByText('Delete OLT')).toBeInTheDocument()
  })

})
