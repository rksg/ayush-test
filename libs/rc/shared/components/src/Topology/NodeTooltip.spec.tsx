import { Node }     from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import NodeTooltip from './NodeTooltip'

const nodeDetail = {
  type: 'Switch',
  name: 'STACK-0313',
  mac: 'c0:c5:20:aa:32:67',
  serial: 'FEK3224R09T',
  id: 'c0:c5:20:aa:32:67',
  status: 'Operational',
  childCount: 0,
  cloudPort: '1/1/1',
  isConnectedCloud: true,
  ipAddress: '10.206.1.112',
  children: [
    {
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
      ipAddress: '10.206.1.38',
      children: []
    },
    {
      type: 'Switch',
      name: 'FMF3250Q06J-1',
      mac: 'c0:c5:20:b2:10:d5',
      serial: 'FMF3250Q06J',
      id: 'c0:c5:20:b2:10:d5',
      status: 'Operational',
      childCount: 0,
      cloudPort: '1/1/8',
      isConnectedCloud: false,
      ipAddress: '10.206.1.103',
      children: [
        {
          type: 'Ap',
          name: '302002029754-C08P',
          mac: '34:20:E3:1C:E6:10',
          serial: '302002029754',
          id: '302002029754',
          status: 'Operational',
          childCount: 0,
          meshRole: 'DOWN',
          uplink: [],
          downlink: [],
          downlinkChannel: '36(5G)',
          uplinkChannel: '144(5G)',
          isMeshEnable: true,
          ipAddress: '10.206.1.231',
          children: []
        }
      ]
    }
  ]
}

describe('NodeTooltip', () => {
  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    const position = { x: 777, y: 180 }
    render(<Provider>
      <NodeTooltip
        tooltipPosition={position}
        tooltipNode={nodeDetail as unknown as Node}
        closeTooltip={jest.fn()} />
    </Provider>,{
      route: { params }
    })
  })
})
