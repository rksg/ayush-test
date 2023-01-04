import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import Administration from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Administration page', () => {
  let params: { tenantId: string, activeTab: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'accountSettings' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Account Settings' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should have correct tabs amount', async () => {
    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(5)
  })

  it('should handle tab changes', async () => {
    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByText('Notifications'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/administration/notifications`,
      hash: '',
      search: ''
    })
  })

  it('should render notifications tab correctly', async () => {
    let params: { tenantId: string, activeTab: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'notifications' }

    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Notifications' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render administrators tab correctly', async () => {
    let params: { tenantId: string, activeTab: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'administrators' }

    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Administrators' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render subscriptions tab correctly', async () => {
    let params: { tenantId: string, activeTab: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'subscriptions' }

    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Subscriptions' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render firmware version management tab correctly', async () => {
    let params: { tenantId: string, activeTab: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'fwVersionMgmt' }

    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Firmware Version Management' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })
})