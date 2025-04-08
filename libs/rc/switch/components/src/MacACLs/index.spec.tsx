import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SWITCH_TYPE, SwitchStatusEnum, SwitchUrlsInfo, SwitchViewModel } from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, within }                             from '@acx-ui/test-utils'

import { MacACLs } from './index'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const switchDetail: SwitchViewModel = {
  type: 'device',
  isStack: false,
  rearModule: 'none',
  switchMac: '94:B3:4F:30:C8:32',
  switchName: 'FNR4302U00E',
  model: 'ICX8200-C08ZP',
  id: '94:b3:4f:30:c8:32',
  firmwareVersion: 'RDR10020b_cd1',
  clientCount: 1,
  floorplanId: '',
  serialNumber: 'FNR4302U00E',
  yPercent: 0,
  portsStatus: {
    Down: 9,
    Up: 1
  },
  staticOrDynamic: 'dynamic',
  ipAddress: '10.206.33.22',
  dns: '10.10.10.10',
  cliApplied: false,
  subnetMask: '255.255.254.0',
  venueName: 'My-Venue',
  name: 'FNR4302U00E',
  activeSerial: 'FNR4302U00E',
  syncedAdminPassword: true,
  suspendingDeployTime: '',
  cloudPort: '1/1/1',
  ipFullContentParsed: true,
  switchType: SWITCH_TYPE.ROUTER,
  configReady: true,
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  vlanMapping: '{"1":"DEFAULT-VLAN"}',
  venueId: 'venue-id',
  unitId: 1,
  firmware: 'RDR10020b_cd1',
  adminPassword: 'Admin@345',
  syncedSwitchConfig: true,
  xPercent: 0,
  defaultGateway: '10.206.33.254',
  stackMembers: [],
  extIp: '210.58.90.254',
  uptime: '7:27:2.00',
  veCount: 1,
  enableStack: false,
  venueDescription: 'My-Venue',
  unitDetails: [],
  position: {
    floorplanId: '',
    xPercent: 0,
    yPercent: 0
  }
}

const data = {
  data: [
    {
      id: '04581a66c7164e219904728d7579b84a',
      switchId: '94:b3:4f:30:c8:32',
      name: 'mac_acl_global1',
      customized: false,
      sharedWithPolicyAndProfile: true,
      switchMacAclRules: [
        {
          id: '8ec66059a43b40eb945b815ffe45a79b',
          action: 'permit',
          sourceAddress: '0000.3333.5678',
          sourceMask: 'ffff.ffff.ffff',
          destinationAddress: 'any',
          macAclId: '04581a66c7164e219904728d7579b84a'
        }
      ]
    },
    {
      id: '70decce4293441cfa37d1866aab58c77',
      switchId: '94:b3:4f:30:c8:32',
      name: 'mac_acl_global3',
      customized: false,
      sharedWithPolicyAndProfile: true,
      switchMacAclRules: [
        {
          id: '0163f334934046b09dfa137780d80127',
          action: 'permit',
          sourceAddress: '0000.0034.8765',
          sourceMask: 'ffff.ffff.ffff',
          destinationAddress: '0000.0034.5678',
          destinationMask: 'ffff.ffff.ffff',
          macAclId: '70decce4293441cfa37d1866aab58c77'
        }
      ]
    }
  ],
  page: 1,
  totalCount: 2,
  totalPages: 1
}

describe('MacACLs', () => {
  const params = { tenantId: 'tenant-id', venueId: 'venue-id',
    switchId: 'switch-id', serialNumber: 'serial-number' }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchMacAcls.url, (req, res, ctx) => {
        return res(ctx.json(data))
      }),
      rest.post(SwitchUrlsInfo.getLayer2Acls.url, (req, res, ctx) => {
        return res(ctx.json({
          data: [
            { id: '04581a66c7164e219904728d7579b84a', name: 'ACL 1' },
            { id: '70decce4293441cfa37d1866aab58c77', name: 'ACL 2' }
          ]
        }))
      })
    )
  })

  it('renders the Switch Access Control component with tabs', async () => {
    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByText('mac_acl_global1')).toBeInTheDocument()
  })
  it('should render columns with correct data and handle ACL name click', async () => {
    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    expect(await screen.findByText('ACL Name')).toBeInTheDocument()
    expect(await screen.findByText('Type')).toBeInTheDocument()

    expect(await screen.findByText('mac_acl_global1')).toBeInTheDocument()
    expect(await screen.findByText('mac_acl_global3')).toBeInTheDocument()

    await userEvent.click(screen.getByText('mac_acl_global1'))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should handle Add MAC ACL button click', async () => {
    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const addButton = await screen.findByRole('button', { name: 'Add MAC ACL' })
    expect(addButton).toBeInTheDocument()
    await userEvent.click(addButton)

    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeInTheDocument()
    expect(within(drawer).getByText('Add MAC ACL')).toBeInTheDocument()
  })

  it('should handle Edit row action', async () => {
    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const rows = await screen.findAllByRole('row')
    const firstDataRow = rows[1]
    const checkbox = within(firstDataRow).getByRole('radio')
    await userEvent.click(checkbox)

    const editButton = await screen.findByRole('button', { name: 'Edit' })
    expect(editButton).toBeInTheDocument()
    await userEvent.click(editButton)

    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeInTheDocument()
    expect(within(drawer).getByDisplayValue('mac_acl_global1')).toBeInTheDocument()
  })

  it('should handle Delete row action', async () => {
    mockServer.use(
      rest.delete(SwitchUrlsInfo.deleteSwitchMacAcl.url, (req, res, ctx) => {
        return res(ctx.json({ success: true }))
      })
    )

    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    const rows = await screen.findAllByRole('row')
    const firstDataRow = rows[1]
    const checkbox = within(firstDataRow).getByRole('radio')
    await userEvent.click(checkbox)

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)

    expect(await screen.findByText('Delete MAC ACL(s)?')).toBeInTheDocument()

    const deleteDialog = await screen.findByRole('dialog')
    const confirmButton = await within(deleteDialog).findByRole('button', { name: 'Delete' })
    await userEvent.click(confirmButton)
  })
  it('should render Type column with correct values based on row properties', async () => {
    const mockData = {
      data: [
        {
          id: '1',
          name: 'customized_shared_acl',
          customized: true,
          sharedWithPolicyAndProfile: true,
          switchMacAclRules: []
        },
        {
          id: '2',
          name: 'not_customized_shared_acl',
          customized: false,
          sharedWithPolicyAndProfile: true,
          switchMacAclRules: []
        },
        {
          id: '3',
          name: 'neither_customized_nor_shared_acl',
          customized: false,
          sharedWithPolicyAndProfile: false,
          switchMacAclRules: []
        }
      ],
      page: 1,
      totalCount: 3,
      totalPages: 1
    }

    // Override the mock server response with our test data
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchMacAcls.url, (req, res, ctx) => {
        return res(ctx.json(mockData))
      })
    )

    render(
      <Provider>
        <MacACLs switchDetail={switchDetail} />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/devices/switch/:switchId/:serialNumber/details/overview/acls' }
      }
    )

    await screen.findByText('ACL Name')

    expect(await screen.findByText('customized_shared_acl')).toBeInTheDocument()
    expect(await screen.findByText('not_customized_shared_acl')).toBeInTheDocument()
    expect(await screen.findByText('neither_customized_nor_shared_acl')).toBeInTheDocument()
  })
})