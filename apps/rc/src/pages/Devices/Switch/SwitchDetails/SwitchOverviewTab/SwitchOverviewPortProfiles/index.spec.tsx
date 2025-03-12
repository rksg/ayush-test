import {
  usePortProfilesListBySwitchIdQuery
} from '@acx-ui/rc/services'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { mockedPortProfilesTableResult } from '../../__tests__/fixtures'

import SwitchOverviewPortProfiles from '.'

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
      data: mockedPortProfilesTableResult,
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

    const profile = mockedPortProfilesTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(profile.name) })

    expect(within(row).getByText(profile.name)).toBeVisible()
    expect(within(row).getByText(profile.type)).toBeVisible()
    expect(within(row).getByText(profile.taggedVlans.length)).toBeVisible()
  })
})