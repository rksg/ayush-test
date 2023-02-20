import '@testing-library/jest-dom'

import { screen }       from '@testing-library/react'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ApDeviceStatusEnum, FloorplanContext, FloorPlanDto, NetworkDeviceType, RogueCategory, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { render }                                                                                                 from '@acx-ui/test-utils'


import NetworkDevices from '.'



const networkDeviceType = Object.values(NetworkDeviceType)

const deviceData = [{
  ap: [{
    deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    id: '302002015732',
    name: '3 02002015736',
    serialNumber: '302002015732',
    xPercent: 65.20548,
    yPercent: 9.839357,
    networkDeviceType: NetworkDeviceType.ap
  },
  {
    deviceStatus: ApDeviceStatusEnum.OPERATIONAL,
    floorplanId: '94bed28abef24175ab58a3800d01e24b',
    id: '302002015733',
    name: '3 02002015736',
    serialNumber: '302002015732',
    xPercent: 65.20548,
    yPercent: 9.839357,
    networkDeviceType: NetworkDeviceType.rogue_ap,
    rogueCategory: { Malicious: 10 },
    rogueCategoryType: RogueCategory.MALICIOUS
  }],
  switches: [{
    deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    id: 'FEK3224R72N',
    name: '',
    switchName: '',
    serialNumber: 'FEK3224R72N',
    xPercent: 52.739727,
    yPercent: 7.056452,
    networkDeviceType: NetworkDeviceType.switch
  }],
  LTEAP: [],
  RogueAP: [],
  cloudpath: [],
  DP: []
}
]

const floorplan: FloorPlanDto = {
  id: '94bed28abef24175ab58a3800d01e24a',
  image: {
    id: '01acff37331949c686d40b5a00822ec2-001.jpeg',
    name: '8.jpeg'
  },
  name: 'TEST_2',
  floorNumber: 0,
  imageId: '01acff37331949c686d40b5a00822ec2-001.jpeg',
  imageName: '8.jpeg',
  imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/01acff37331949c686d40b5a00822ec2-001.jpeg'
}

describe('Floor Plans Nework Devices', () => {

  it('should render correctly', async () => {

    await render(<DndProvider backend={HTML5Backend}><NetworkDevices
      networkDevicesVisibility={networkDeviceType}
      selectedFloorPlan={floorplan}
      networkDevices={{ '94bed28abef24175ab58a3800d01e24a': deviceData[0] }}
      galleryMode={false}
      contextAlbum={false}
      context={FloorplanContext.ap}/></DndProvider>)

    const devices = await screen.findAllByTestId('SignalUp')

    expect(devices[0]).toBeVisible()
  })

  it('should render rogue Ap correctly', async () => {

    await render(<DndProvider backend={HTML5Backend}><NetworkDevices
      networkDevicesVisibility={networkDeviceType}
      selectedFloorPlan={floorplan}
      networkDevices={{ '94bed28abef24175ab58a3800d01e24a': deviceData[0] }}
      galleryMode={false}
      contextAlbum={false}
      context={FloorplanContext.ap}
      showRogueAp={true}/></DndProvider>)

    const devices = await screen.findAllByTestId('SignalUp')
    const devicesCount = await screen.findByTestId('rogueApBadge')

    expect(devices[0]).toBeVisible()
    expect(devicesCount.innerHTML).toBe('10')
  })

})
