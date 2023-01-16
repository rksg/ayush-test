/* eslint-disable max-len */
import {
  ApVenueStatusEnum, EdgePortStatus, EdgePortTypeEnum, EdgeStatus, EdgeStatusEnum
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { EdgePortsByTrafficWidget, EdgeResourceUtilizationWidget, EdgeTrafficByVolumeWidget } from '.'

const tenantID = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const currentEdge:EdgeStatus = {
  name: 'edge-01',
  serialNumber: 'edge-111000001',
  venueId: '97b77f8a82324a1faa0f4cc3f56d1ef0',
  venueName: 'testVenue_Edge',
  model: 'test',
  type: 'test',
  deviceStatus: EdgeStatusEnum.OPERATIONAL,
  deviceStatusSeverity: ApVenueStatusEnum.OPERATIONAL,
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
const edgePortsSetting:EdgePortStatus[] = [{
  portId: '1',
  name: 'Port 1',
  status: 'Up',
  adminStatus: 'Enabled',
  type: EdgePortTypeEnum.WAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 12* Math.pow(12, 6),
  duplex: 'Full',
  ip: '1.1.1.1',
  sortIdx: 1
},
{
  portId: '2',
  name: 'Port 2',
  status: 'Down',
  adminStatus: 'Disabled',
  type: EdgePortTypeEnum.LAN,
  mac: 'AA:BB:CC:DD:EE:FF',
  speedKbps: 10* Math.pow(12, 6),
  duplex: 'Helf',
  ip: '1.1.1.2',
  sortIdx: 2
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

  it('shoud render EdgeResourceUtilizationWidget with no data', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeResourceUtilizationWidget/>
      </Provider>,{
        route: { params, path: '/:tenantId/devices/edge/:serialNumber/edge-details/overview' }
      })

    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(0)
  })
})
