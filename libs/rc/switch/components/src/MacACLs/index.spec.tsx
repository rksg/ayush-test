import { rest } from 'msw'

import { SWITCH_TYPE, SwitchStatusEnum, SwitchUrlsInfo, SwitchViewModel } from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen }                                     from '@acx-ui/test-utils'

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
})