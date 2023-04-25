import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'
import { RolesEnum }                          from '@acx-ui/types'
import { getUserProfile, setUserProfile }     from '@acx-ui/user'

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

describe('ApTabs', () => {
  it('should render correctly', async () => {
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
      pathname: `/t/${params.tenantId}/devices/wifi/${params.serialNumber}/details/networks`,
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
        `/t/${params.tenantId}/devices/wifi/${params.serialNumber}/details/troubleshooting/ping`,
      hash: '',
      search: ''
    })
  })

  it('should hide analytics when role is READ_ONLY', async () => {
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    render(<Provider>
      <ApTabs apDetail={apDetailData} />
    </Provider>, { route: { params } })
    expect(screen.queryByText('AI Analytics')).toBeNull()
  })
})
