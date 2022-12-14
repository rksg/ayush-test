/* eslint-disable max-len */
import {
  EdgeStatusEnum,
  ApVenueStatusEnum,
  EdgeStatus,
  EdgePort,
  EdgePortTypeEnum
} from '@acx-ui/rc/utils'
import { Provider  } from '@acx-ui/store'
import { render }    from '@acx-ui/test-utils'

import { EdgePortsByTrafficWidget, EdgeTrafficByVolumeWidget } from '.'

const tenantID = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const currentEdge:EdgeStatus = {
  name: 'edge-01',
  serialNumber: 'edge-111000001',
  venueId: '97b77f8a82324a1faa0f4cc3f56d1ef0',
  venueName: 'testVenue_Edge',
  model: 'test',
  type: 'test',
  deviceStatus: ApVenueStatusEnum.OPERATIONAL,
  deviceStatusSeverity: EdgeStatusEnum.OPERATIONAL,
  ip: '1.1.1.1',
  ports: '62,66',
  tags: [],
  cpuTotal: 65 * Math.pow(1024, 2),
  cpuUsed: 5 * Math.pow(1024, 2),
  memTotal: 120 * Math.pow(1024, 2),
  memUsed: 50 * Math.pow(1024, 2),
  diskTotal: 250 * Math.pow(1024, 3),
  diskUsed: 162 * Math.pow(1024, 3)
}
const edgePortsSetting:EdgePort[] = [{
  portId: '1',
  portName: 'Port 1',
  status: 'Up',
  adminStatus: 'Enabled',
  portType: EdgePortTypeEnum.WAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speed: 12* Math.pow(12, 6),
  duplexSpeed: 100* Math.pow(12, 6),
  ip: '1.1.1.1'
},
{
  portId: '2',
  portName: 'Port 2',
  status: 'Down',
  adminStatus: 'Disabled',
  portType: EdgePortTypeEnum.LAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speed: 10* Math.pow(12, 6),
  duplexSpeed: 100* Math.pow(12, 6),
  ip: '1.1.1.2'
}]

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge Statistic Widget', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: tenantID, serialNumber: currentEdge.serialNumber }


  it('should render EdgePortsByTrafficWidget correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgePortsByTrafficWidget edgePortsSetting={edgePortsSetting} isLoading={false}/>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(1)
  })

  it('shoud render EdgeTrafficByVolumeWidget with no data', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeTrafficByVolumeWidget/>
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(0)
  })
})
