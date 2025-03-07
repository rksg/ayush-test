import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { PropertyConfigStatus, ConnectionMetering, PropertyUrlsInfo, PropertyUnitStatus } from '@acx-ui/rc/utils'
import { BrowserRouter as Router }                                                        from '@acx-ui/react-router-dom'
import { Provider }                                                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen,  waitFor, within }                        from '@acx-ui/test-utils'


import { mockPropertyUnitList } from '../../../__tests__/fixtures'

import { PropertyUnitDetails } from './index'

const personaIds = { data: [
  { unitId: '', personaType: '', personaId: '123', links: [] },
  { unitId: '', personaType: '', personaId: '456', links: [] },
  { unitId: '', personaType: '', personaId: '789', links: [] }
] }

const propertyConfigs = {
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'personaGroupId123'
}

const unitData = {
  personaId: 'personaId123',
  guestPersonaId: 'guestPersonaId123',
  resident: {
    name: 'Test Resident Name'
  },
  status: PropertyUnitStatus.ENABLED
}

const personaData = {
  vlan: 'vlan123',
  dpskPassphrase: 'dpskPassphrase123'
}

const personaDetails = {
  data: [{
    id: '123',
    name: 'identity-name-1',
    groupId: '',
    revoked: false
  },
  {
    id: '456',
    name: 'identity-name-2',
    groupId: '',
    revoked: true
  }]
}

const connectionMeteringList: ConnectionMetering[] = [{
  id: '12345',
  name: 'name12345',
  uploadRate: 1,
  downloadRate: 1,
  dataCapacity: 1,
  dataCapacityThreshold: 1,
  dataCapacityEnforced: false,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED',
  billingCycleDays: 1
}]

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

const services = require('@acx-ui/rc/services')
const mockGetUnitByIdQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: unitData }
))
const mockGetPersonaByIdQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: personaData }
))
const mockGetPersonaGroupByIdQuery = jest.fn().mockImplementation(() => Promise.resolve(
  { data: { personalIdentityNetworkId: 'personalIdentityNetworkId123' } }
))
const mockUpdatePropertyUnitMutation = jest.fn().mockImplementation(() => Promise.resolve())
const mockUpdatePersonaMutation = jest.fn().mockImplementation(() => Promise.resolve())
const mockDeleteAssociationMutation = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useLazyGetPropertyUnitByIdQuery: () =>
    ([ mockGetUnitByIdQuery, { data: { name: 'Test Venue' } } ]),
  useLazyGetPersonaByIdQuery: () => ([ mockGetPersonaByIdQuery, { data: {} } ]),
  useLazyGetPersonaGroupByIdQuery: () => ([ mockGetPersonaGroupByIdQuery, {} ]),
  useUpdatePropertyUnitMutation: () => ([ mockUpdatePropertyUnitMutation ]),
  useUpdatePersonaMutation: () => ([ mockUpdatePersonaMutation ]),
  useDeletePersonaAssociationMutation: () => ([ mockDeleteAssociationMutation ])
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useTenantLink: () => jest.fn(),
  useHref: () => {},
  useParams: () => { return { tenantId: 'tenantId', venueId: 'venueId', unitId: 'unitId' } }
}))

const openFn = jest.fn()
describe('Property Unit Details', () => {
  beforeEach(() => {
    openFn.mockClear()
    window.open = openFn
    services.useGetUnitsLinkedIdentitiesQuery = jest.fn().mockImplementation(() => {
      return { data: personaIds, refetch: jest.fn() }
    })
    services.useSearchPersonaListQuery = jest.fn().mockImplementation(() => {
      return { data: personaDetails }
    })
    services.useGetPropertyConfigsQuery = jest.fn().mockImplementation(() => {
      return { data: propertyConfigs }
    })
    services.useGetVenueQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useGetConnectionMeteringListQuery = jest.fn().mockImplementation(() => {
      return { data: { data: connectionMeteringList } }
    })
    services.useGetVenueLanPortsQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    services.useApListQuery = jest.fn().mockImplementation(() => {
      return { data: {} }
    })
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getUnitsLinkedIdentities.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => res(ctx.json(unitData))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockPropertyUnitList))
        }
      )
    )
  })

  it('should render drawer correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    await screen.findByText('Test Venue')
    await screen.findByText('Unit Details')
    await screen.findByRole('button', { name: 'Suspend' })
    screen.getByRole('button', { name: 'View Portal' })
    screen.getByRole('button', { name: 'Configure' })
    screen.getByRole('button', { name: 'Add Identity Association' })
  })

  it('pageheader buttons should work correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    await userEvent.click(await screen.findByRole('button', { name: 'Suspend' }))
    await screen.findByText('Suspend "Test Venue"?')
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspend' }))
    await waitFor(() => expect(mockUpdatePropertyUnitMutation).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'View Portal' }))
    await waitFor(() => expect(openFn).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    expect(await screen.findByText('Edit Unit')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByText('Edit Unit')).toBeNull())
  })

  it('add identity association should open drawer', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    await userEvent.click(screen.getByRole('button', { name: 'Add Identity Association' }))
    expect(await screen.findAllByText('Add Identity Association')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.getAllByText('Add Identity Association')).toHaveLength(1))
  })

  it('should block/unblock row correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    const row1 = await screen.findByRole('row', { name: /identity-name-1/i })
    expect(within(row1).getByText('Active')).toBeVisible()
    await userEvent.click(within(row1).getByRole('checkbox'))
    const alert = screen.getByRole('alert')
    await userEvent.click(within(alert).getByRole('button', { name: 'Block' }))
    const blockDialog = await screen.findByRole('dialog')
    await screen.findByText('Block this identity: identity-name-1')
    await userEvent.click(within(blockDialog).getByRole('button', { name: 'Block' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(mockUpdatePersonaMutation).toHaveBeenCalled()
    mockUpdatePersonaMutation.mockClear()

    const row2 = await screen.findByRole('row', { name: /identity-name-2/i })
    expect(within(row2).getByText('Blocked')).toBeVisible()
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Unblock' }))
    expect(mockUpdatePersonaMutation).toHaveBeenCalled()

    await userEvent.click(within(row1).getByRole('checkbox'))
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Block' }))
    await screen.findByRole('dialog')
    await screen.findByText('Block 2 identities')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })

  it('should remove association correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    const row = await screen.findByRole('row', { name: /identity-name-1/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Remove Association' }))
    const removeDialog = await screen.findByRole('dialog')
    await screen.findByText('Remove this association: identity-name-1')
    await userEvent.click(within(removeDialog).getByRole('button', { name: 'Remove Association' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(mockDeleteAssociationMutation).toHaveBeenCalled()

    const row1 = await screen.findByRole('row', { name: /identity-name-1/i })
    const row2 = await screen.findByRole('row', { name: /identity-name-2/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    await userEvent.click(within(row2).getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Remove Association' }))
    await screen.findByRole('dialog')
    await screen.findByText('Remove 2 associations')
  })

  it('should copy passphrase correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    const spy = jest.spyOn(navigator.clipboard, 'writeText')
    await screen.findByText('Test Resident Name')

    fireEvent.mouseOver(screen.getByTestId('copy'))
    await screen.findByRole('tooltip', { name: 'Copy Passphrase' })
    fireEvent.mouseOut(screen.getByTestId('copy'))
    fireEvent.click(screen.getByTestId('copy'))
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith('dpskPassphrase123'))
  })

  it('should copy guest passphrase correctly', async () => {
    render(<Router><Provider>
      <PropertyUnitDetails />
    </Provider></Router>)

    const spy = jest.spyOn(navigator.clipboard, 'writeText')
    await screen.findByText('Test Resident Name')

    fireEvent.mouseOver(screen.getByTestId('guest-copy'))
    await screen.findByRole('tooltip', { name: 'Copy Passphrase' })
    fireEvent.mouseOut(screen.getByTestId('guest-copy'))
    fireEvent.click(screen.getByTestId('guest-copy'))
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith('dpskPassphrase123'))
  })
})
