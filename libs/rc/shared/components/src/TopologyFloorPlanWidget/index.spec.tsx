import { ApDeviceStatusEnum, DeviceStates, DeviceTypes, NetworkDevice, NetworkDevicePosition, NetworkDeviceType, ShowTopologyFloorplanOn, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider  }                                                                                                                                         from '@acx-ui/store'
import { render }                                                                                                                                            from '@acx-ui/test-utils'

import { TopologyFloorPlanWidget } from '.'

jest.mock('../FloorPlan', () => ({
  FloorPlan: () => <div>Floor Plan</div>
}))

jest.mock('../Topology', () => ({
  Topology: () => <div>Topology</div>
}))

const currentApDevice = {
  type: DeviceTypes.Ap,
  category: 'Ap',
  name: 'Ap001',
  mac: '5C:DF:89:2A:AF:01',
  serial: '534689211601',
  id: '5C:DF:89:2A:AF:01',
  states: DeviceStates.Regular,
  deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
  networkDeviceType: NetworkDeviceType.ap,
  serialNumber: '',
  childCount: 0
} as NetworkDevice

const currentSwitchDevice = {
  type: DeviceTypes.Switch,
  category: 'Switch',
  name: 'Switch001',
  mac: 'C0:C5:20:7E:A5:01',
  serial: 'D0D5408E5E02',
  id: 'C0:C5:20:7E:A5:01',
  states: DeviceStates.Regular,
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  networkDeviceType: NetworkDeviceType.switch,
  serialNumber: '',
  childCount: 3
} as NetworkDevice

describe.skip('TopologyFloorPlanWidget', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<Provider><TopologyFloorPlanWidget
      showTopologyFloorplanOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW} /></Provider>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render floorplan topology widget under AP overview', () => {
    const { asFragment } = render(<Provider><TopologyFloorPlanWidget
      showTopologyFloorplanOn={ShowTopologyFloorplanOn.AP_OVERVIEW}
      currentDevice={currentApDevice}
      venueId='7231da344778480d88f37f0cca1c534f'
      devicePosition={{ floorplanId: '',
        xPercent: 0,
        yPercent: 0 } as NetworkDevicePosition}/></Provider>,{
      route: { params: { venueId: '7231da344778480d88f37f0cca1c534f' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render floorplan topology widget under Switch overview', () => {
    const { asFragment } = render(<Provider><TopologyFloorPlanWidget
      showTopologyFloorplanOn={ShowTopologyFloorplanOn.SWITCH_OVERVIEW}
      currentDevice={currentSwitchDevice}
      venueId='7231da344778480d88f37f0cca1c534f'
      devicePosition={{ floorplanId: '',
        xPercent: 0,
        yPercent: 0 } as NetworkDevicePosition}/></Provider>,{
      route: { params: { venueId: '7231da344778480d88f37f0cca1c534f' } }
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
