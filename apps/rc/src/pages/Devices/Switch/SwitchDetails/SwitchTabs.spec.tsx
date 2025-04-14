/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { get }                                                               from '@acx-ui/config'
import { Provider }                                                          from '@acx-ui/store'
import { render, screen, waitFor, fireEvent }                                from '@acx-ui/test-utils'
import { getUserProfile, RaiPermissions, setRaiPermissions, setUserProfile } from '@acx-ui/user'
import { AccountTier }                                                       from '@acx-ui/utils'

import { switchDetailData } from './__tests__/fixtures'
import SwitchTabs           from './SwitchTabs'

const params = {
  tenantId: 'tenantId',
  switchId: 'switchId',
  serialNumber: 'serialNumber'
}
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('SwitchTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Clients (1)')).toBeVisible()
  })

  it('should render correctly with Core Tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })

    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })



    expect(await screen.findByText('Clients (1)')).toBeVisible()
    const downIcon = screen.queryByText('Incidents')
    expect(downIcon).toBeNull()
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Clients (1)'))
    fireEvent.click(await screen.findByText('Clients (1)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/switch/${params.switchId}/${params.serialNumber}/details/clients`,
      hash: '',
      search: ''
    })
  })

  it('should hide incidents when READ_INCIDENTS permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })
    expect(screen.queryByText('Incidents')).toBeNull()
  })
})
