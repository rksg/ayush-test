import { Node, Link }     from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import LinkTooltip from './LinkTooltip'

const sourceNodeDetail = {
  type: 'Switch',
  name: 'STACK-0313',
  mac: 'c0:c5:20:aa:32:67',
  serial: 'FEK3224R09T',
  id: 'c0:c5:20:aa:32:67',
  status: 'Operational',
  childCount: 0,
  cloudPort: '1/1/1',
  isConnectedCloud: true,
  ipAddress: '10.206.1.112'
}

const targetNodeDetail = {
  type: 'ApMeshRoot',
  name: '302002029829-C12P',
  mac: '34:20:E3:1C:EA:C0',
  serial: '302002029829',
  id: '302002029829',
  status: 'Operational',
  childCount: 0,
  meshRole: 'RAP',
  uplink: [],
  downlink: [],
  downlinkChannel: '144(5G)',
  isMeshEnable: true,
  ipAddress: '10.206.1.38'
}

const edgeDetail = {
  from: 'c0:c5:20:aa:32:67',
  to: '302002029829',
  fromMac: 'C0:C5:20:AA:32:67',
  toMac: '34:20:E3:1C:EA:C0',
  fromName: 'STACK-0313',
  toName: '302002029829-C12P',
  poeEnabled: true,
  linkSpeed: '1 Gb/sec',
  poeUsed: 6200,
  poeTotal: 28850,
  connectedPort: '2/1/2',
  connectionType: 'Wired',
  connectionStatus: 'Good',
  fromSerial: 'FEK3224R09T',
  toSerial: '302002029829',
  connectedPortUntaggedVlan: '1',
  connectedPortTaggedVlan: ''
}


const sourceNodeNullDetail = {
  type: 'Switch',
  serial: 'FEK3224R09T',
  status: 'Operational',
  childCount: 0,
  cloudPort: '1/1/1',
  isConnectedCloud: true,
  ipAddress: '10.206.1.112'
}

const targetNodeNullDetail = {
  type: 'Switch',
  serial: '302002029829',
  id: '302002029829',
  status: 'Operational',
  childCount: 0,
  meshRole: 'RAP',
  uplink: [],
  downlink: [],
  downlinkChannel: '144(5G)',
  isMeshEnable: true,
  ipAddress: '10.206.1.38'
}

const edgeNullDetail = {
  from: 'c0:c5:20:aa:32:67',
  to: '302002029829',
  fromMac: 'C0:C5:20:AA:32:67',
  toMac: '34:20:E3:1C:EA:C0',
  poeEnabled: false,
  poeUsed: 6200,
  poeTotal: 28850,
  correspondingPort: '1',
  connectionType: 'Wired',
  connectionStatus: 'Good',
  fromSerial: 'FEK3224R09T',
  toSerial: '302002029829',
  correspondingPortUntaggedVlan: '1'
}

describe('NodeTooltip', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const position = { x: 777, y: 180 }
    render(
      <Provider>
        <LinkTooltip
          tooltipPosition={position}
          tooltipSourceNode={sourceNodeDetail as unknown as Node}
          tooltipTargetNode={targetNodeDetail as unknown as Node}
          tooltipEdge={edgeDetail as unknown as Link}
          onClose={jest.fn()}
        />
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('STACK-0313')).toBeVisible()
    expect(await screen.findByText('302002029829-C12P')).toBeVisible()
    expect(await screen.findByText('1 Gb/sec')).toBeVisible()
    expect(await screen.findByText('2/1/2')).toBeVisible()
    expect(await screen.findByText('On(6200 / 28850)')).toBeVisible()
  })
  it('should render null values correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const position = { x: 777, y: 180 }
    render(
      <Provider>
        <LinkTooltip
          tooltipPosition={position}
          tooltipSourceNode={sourceNodeNullDetail as unknown as Node}
          tooltipTargetNode={targetNodeNullDetail as unknown as Node}
          tooltipEdge={edgeNullDetail as unknown as Link}
          onClose={jest.fn()}
        />
      </Provider>,
      {
        route: { params }
      }
    )
    expect((await screen.findAllByText('302002029829')).length).toEqual(1)
    expect(await screen.findByText('Off')).toBeVisible()
  })
})
