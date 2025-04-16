import '@testing-library/jest-dom'

import { get }                                from '@acx-ui/config'
import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import {
  RaiPermissions,
  setRaiPermissions,
  setUserProfile,
  getUserProfile
} from '@acx-ui/user'
import { AccountTier } from '@acx-ui/utils'

import { apDetailData } from './__tests__/fixtures'
import ApTabs           from './ApTabs'

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'ap-id'
}
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useApContext: () => params
}))

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('ApTabs', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(8)
  })

  it('should render correctly with CORE tier', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: getUserProfile().profile,
      accountTier: AccountTier.CORE
    })

    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    expect(screen.getAllByRole('tab')).toHaveLength(7)
  })

  it('should handle tab changes', async () => {
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText('Networks (2)'))
    fireEvent.click(await screen.findByText('Networks (2)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/wifi/${params.serialNumber}/details/networks`,
      hash: '',
      search: ''
    })
  })

  it('should handle troubleshooting tab changes', async () => {
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    await waitFor(() => screen.findByText(/Troubleshooting/))
    fireEvent.click(await screen.findByText(/Troubleshooting/))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname:
        `/${params.tenantId}/t/devices/wifi/${params.serialNumber}/details/troubleshooting/ping`,
      hash: '',
      search: ''
    })
  })

  it('should hide analytics when READ_INCIDENTS permission is false', async () => {
    mockGet.mockReturnValue('true')
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    expect(screen.queryByText('AI Analytics')).toBeNull()
  })

})
