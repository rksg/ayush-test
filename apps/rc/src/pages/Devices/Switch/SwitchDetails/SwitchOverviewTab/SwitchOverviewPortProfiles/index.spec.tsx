import {
  usePortProfilesListBySwitchIdQuery
} from '@acx-ui/rc/services'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import SwitchOverviewPortProfiles from '.'

const mockedTableResult = {
  data: [
    {
      id: '7d869ac0d966458d8f6d41491445f570',
      name: 'pProfileGlobal2',
      type: 'STATIC',
      taggedVlans: [
        '4'
      ],
      untaggedVlans: 20,
      poeEnable: true,
      poeClass: 'ZERO',
      poePriority: 0,
      portSpeed: 'NONE',
      portProtected: false,
      rstpAdminEdgePort: false,
      stpBpduGuard: false,
      stpRootGuard: false,
      dhcpSnoopingTrust: false,
      ipsg: false,
      dot1x: false,
      macAuth: false,
      ports: [
        '1/1/48'
      ]
    }
  ],
  fields: [
    'id'
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}

jest.mock('@acx-ui/rc/services', () => ({
  usePortProfilesListBySwitchIdQuery: jest.fn()
}))

describe('SwitchPortProfileTable', () => {
  const params = {
    tenantId: 'test-tenant-id'
  }

  const tablePath = '/:tenantId/t/policies/portProfile/switch/profiles'

  beforeEach(() => {
    // Mock the RTK Query hooks
    (usePortProfilesListBySwitchIdQuery as jest.Mock).mockReturnValue({
      data: mockedTableResult,
      isLoading: false,
      isFetching: false
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render table with correct columns', async () => {
    render(
      <Provider>
        <SwitchOverviewPortProfiles />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    // Check column headers
    expect(screen.getByText('Name')).toBeVisible()
    expect(screen.getByText('Type')).toBeVisible()
    expect(screen.getByText('Untagged VLAN')).toBeVisible()
    expect(screen.getByText('Tagged VLAN')).toBeVisible()
    expect(screen.getByText('MAC OUI')).toBeVisible()
    expect(screen.getByText('LLDP TLV')).toBeVisible()
  })

  it('should display profile data correctly', async () => {
    render(
      <Provider>
        <SwitchOverviewPortProfiles />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    const profile = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(profile.name) })

    expect(within(row).getByText(profile.name)).toBeVisible()
    expect(within(row).getByText(profile.type)).toBeVisible()
    expect(within(row).getByText(profile.taggedVlans.length)).toBeVisible()
  })
})