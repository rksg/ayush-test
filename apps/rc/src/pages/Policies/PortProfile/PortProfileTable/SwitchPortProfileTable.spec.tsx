import userEvent from '@testing-library/user-event'

import {
  useDeleteSwitchPortProfileMutation,
  useSwitchPortProfilesListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import { CountAndNames } from '@acx-ui/rc/utils'
import { Provider }      from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import SwitchPortProfileTable from './SwitchPortProfileTable'

const mockedTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'profile1',
    name: 'Profile One',
    type: 'Standard',
    untaggedVlan: '10',
    taggedVlans: ['20', '30'],
    macOuis: [{ oui: 'AA:BB:CC' }, { oui: 'BB:CC:DD' }, { oui: 'CC:DD:EE' }],
    lldpTlvs: [{ systemName: 'Switch1' }],
    dot1x: true,
    macAuth: false,
    appliedSwitchesInfo: []
  }]
}

const mockedTableMultipleResults = {
  totalCount: 2,
  page: 1,
  data: [{
    id: 'profile1',
    name: 'Profile One',
    type: 'Standard',
    untaggedVlan: '10',
    taggedVlans: ['20', '30'],
    macOuis: [{ oui: 'AA:BB:CC' }, { oui: 'BB:CC:DD' }, { oui: 'CC:DD:EE' }],
    lldpTlvs: [{ systemName: 'Switch1' }],
    dot1x: true,
    macAuth: false,
    appliedSwitchesInfo: []
  }, {
    id: 'profile2',
    name: 'Profile Two',
    type: 'Advanced',
    untaggedVlan: '15',
    taggedVlans: ['25', '35'],
    macOuis: [{ oui: 'DD:EE:FF' }],
    lldpTlvs: [{ systemName: 'Switch2' }],
    dot1x: false,
    macAuth: true,
    appliedSwitchesInfo: [{
      switchId: 'switchId',
      switchName: 'Switch1',
      venueId: 'venueId',
      venueName: 'Venue1'
    }]
  }]
}

const mockedVenuesResult = {
  fields: [
    'country',
    'latitude',
    'name',
    'id',
    'longitude'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'venueId',
      name: 'Venue1',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908'
    }
  ]
}

jest.mock('@acx-ui/rc/components', () => ({
  CountAndNamesTooltip: ({ data }:{ data: CountAndNames }) => <>
    <div data-testid='venue-count'>count:{data.count}</div>
    <div data-testid='venue-names'>names:{data.names.join(',')}</div>
  </>
}))

jest.mock('@acx-ui/rc/services', () => ({
  useSwitchPortProfilesListQuery: jest.fn(),
  useDeleteSwitchPortProfileMutation: jest.fn(),
  useVenuesListQuery: jest.fn()
}))

describe('SwitchPortProfileTable', () => {
  const params = {
    tenantId: 'test-tenant-id'
  }

  const tablePath = '/:tenantId/t/policies/portProfile/switch/profiles'

  beforeEach(() => {
    // Mock the RTK Query hooks
    (useSwitchPortProfilesListQuery as jest.Mock).mockReturnValue({
      data: mockedTableResult,
      isLoading: false,
      isFetching: false
    })

    ;(useVenuesListQuery as jest.Mock).mockReturnValue({
      data: mockedVenuesResult,
      isLoading: false,
      isFetching: false
    })

    const mockDeleteMutation = jest.fn().mockResolvedValue({ data: { requestId: '12345' } })
    ;(useDeleteSwitchPortProfileMutation as jest.Mock).mockReturnValue([
      mockDeleteMutation,
      { isLoading: false }
    ])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render table with correct columns', async () => {
    render(
      <Provider>
        <SwitchPortProfileTable />
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
    expect(screen.getByText('Switches')).toBeVisible()
  })

  it('should display profile data correctly', async () => {
    render(
      <Provider>
        <SwitchPortProfileTable />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    const profile = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(profile.name) })

    expect(within(row).getByText(profile.name)).toBeVisible()
    expect(within(row).getByText(profile.type)).toBeVisible()
    expect(within(row).getByText(profile.untaggedVlan)).toBeVisible()
    expect(within(row).getByText('2')).toBeVisible() // Tagged VLANs count
  })

  it('should handle delete profile without switches', async () => {
    const mockDeleteFn = jest.fn().mockResolvedValue({ data: { requestId: '12345' } })
    ;(useDeleteSwitchPortProfileMutation as jest.Mock).mockReturnValue([
      mockDeleteFn,
      { isLoading: false }
    ])

    render(
      <Provider>
        <SwitchPortProfileTable />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    const profile = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(profile.name) })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText(`Delete ${profile.name}?`)).toBeVisible()

    const delBtn = await within(await screen.findByRole('dialog'))
      .findByRole('button', { name: /Delete/ })
    await userEvent.click(delBtn)

    await waitFor(() => {
      expect(mockDeleteFn).toHaveBeenCalledWith({ params: { portProfileId: profile.id } })
    })
  })

  it('should show warning when deleting profile with switches', async () => {
    (useSwitchPortProfilesListQuery as jest.Mock).mockReturnValue({
      data: mockedTableMultipleResults,
      isLoading: false,
      isFetching: false
    })
    render(
      <Provider>
        <SwitchPortProfileTable />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    const profile1 = mockedTableMultipleResults.data[0]
    const row1 = await screen.findByRole('row', { name: new RegExp(profile1.name) })
    await userEvent.click(within(row1).getByRole('checkbox'))
    const profile2 = mockedTableMultipleResults.data[1]
    const row2 = await screen.findByRole('row', { name: new RegExp(profile2.name) })
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/ }))

    const delDialog = await within(await screen.findByRole('dialog'))
      .findByText('Delete ICX Port Profile(s)?')
    expect(delDialog).toBeVisible()
    expect(
      screen.getByText(/will cause the associated ports to lose the configuration/)).toBeVisible()
  })

  it('should navigate to edit view', async () => {
    render(
      <Provider>
        <SwitchPortProfileTable />
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    const profile = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(profile.name) })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))
  })
})