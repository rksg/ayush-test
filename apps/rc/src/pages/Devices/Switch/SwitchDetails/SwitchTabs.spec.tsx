/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                          from '@acx-ui/types'
import { getUserProfile, setUserProfile }     from '@acx-ui/user'

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

describe('SwitchTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Clients (1)')).toBeVisible()
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

  it('should hide incidents when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    render(<Provider>
      <SwitchTabs switchDetail={switchDetailData} />
    </Provider>, { route: { params } })
    expect(screen.queryByText('Incidents')).toBeNull()
  })
})
