import '@testing-library/jest-dom'

import { rest }         from 'msw'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ApDeviceStatusEnum, FloorPlanDto, NetworkDeviceType, SwitchStatusEnum, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { fireEvent, mockServer, render, screen, waitFor }                                                from '@acx-ui/test-utils'

import { NetworkDeviceContext } from '..'

import GalleryView from './GalleryView'



const list: FloorPlanDto[] = [
  {
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
  },
  {
    id: '01abc6a927e6445dba33c52fce9b4c3d',
    image: {
      id: '7231da344778480d88f37f0cca1c534f-001.png',
      name: 'download.png'
    },
    name: 'dscx',
    floorNumber: 2,
    imageId: '7231da344778480d88f37f0cca1c534f-001.png',
    imageName: 'download.png',
    imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
  },
  {
    id: '01abc6a927e6445dba33c52fce9b4c3e',
    image: {
      id: '7231da344778480d88f37f0cca1c534f-001.png',
      name: 'download.png'
    },
    name: 'dscx',
    floorNumber: 2,
    imageId: '7231da344778480d88f37f0cca1c534f-001.png',
    imageName: 'download.png',
    imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
  },
  {
    id: '01abc6a927e6445dba33c52fce9b4c3f',
    image: {
      id: '7231da344778480d88f37f0cca1c534f-001.png',
      name: 'download.png'
    },
    name: 'dscx',
    floorNumber: 2,
    imageId: '7231da344778480d88f37f0cca1c534f-001.png',
    imageName: 'download.png',
    imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
  },
  {
    id: '01abc6a927e6445dba33c52fce9b4c3g',
    image: {
      id: '7231da344778480d88f37f0cca1c534f-001.png',
      name: 'download.png'
    },
    name: 'dscx',
    floorNumber: 2,
    imageId: '7231da344778480d88f37f0cca1c534f-001.png',
    imageName: 'download.png',
    imageUrl:
    '/api/file/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
  }]

const networkDevices: {
    [key: string]: TypeWiseNetworkDevices
} = {
  '94bed28abef24175ab58a3800d01e24a': {
    ap: [{
      deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
      floorplanId: '94bed28abef24175ab58a3800d01e24a',
      id: '302002015732',
      name: '3 02002015736',
      serialNumber: '302002015732',
      position: {
        floorplanId: '94bed28abef24175ab58a3800d01e24a',
        xPercent: 65.20548,
        yPercent: 9.839357
      },
      xPercent: 65.20548,
      yPercent: 9.839357,
      networkDeviceType: NetworkDeviceType.ap
    }],
    switches: [{
      deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
      floorplanId: '94bed28abef24175ab58a3800d01e24a',
      id: 'FEK3224R72N',
      name: 'FEK3224R232N',
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
}

const _networkDevicesVisibility: NetworkDeviceType[] = []

for (let deviceType in NetworkDeviceType) {
  if (deviceType === NetworkDeviceType.rogue_ap) {
    continue // rogue ap is not controlled(placed) by user
  }
  const _deviceType = deviceType as keyof typeof NetworkDeviceType
  const networkDevicetype = NetworkDeviceType[_deviceType] as NetworkDeviceType
  _networkDevicesVisibility.push(networkDevicetype)
}

const imageObj = { '01acff37331949c686d40b5a00822ec2-001.jpeg': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/01acff37331949c686d40b5a00822ec2-001.jpeg'
},
'7231da344778480d88f37f0cca1c534f-001.png': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
}
}


describe('Floor Plan Gallery View', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          const { imageId } = req.params as { imageId: keyof typeof imageObj }
          return res(ctx.json({ ...imageObj[imageId], imageId }))
        }
      )
    )}
  )

  it('should render correctly Gallery View', async () => {

    render(<NetworkDeviceContext.Provider value={jest.fn()}>
      <DndProvider backend={HTML5Backend}><GalleryView
        setCoordinates={jest.fn()}
        floorPlans={list}
        onFloorPlanClick={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={_networkDevicesVisibility}/></DndProvider>
    </NetworkDeviceContext.Provider>)

    await waitFor(() => {
      expect(screen.queryAllByTestId('fpImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('fpImage')[1]).toHaveAttribute('src',
        imageObj['7231da344778480d88f37f0cca1c534f-001.png'].signedUrl
      )
    })
    const component = await screen.findAllByTestId('fpImage')
    expect(component.length).toEqual(list.length)

    expect(await screen.findByTestId('SignalUp')).toBeVisible()

    const src = await screen.findByTestId('SignalUp')

    const dst = await screen.findAllByTestId('dropContainer')

    fireEvent.dragStart(src)
    fireEvent.dragEnter(dst[0])
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dst[0])
    fireEvent.dragLeave(dst[0])
    fireEvent.dragEnd(src)

    // expect(asFragment()).toMatchSnapshot()
  })

  it('handles click on gallery item', async () => {
    const onFloorPlanClick = jest.fn()

    render(<DndProvider backend={HTML5Backend}><GalleryView
      setCoordinates={jest.fn()}
      floorPlans={list}
      onFloorPlanClick={onFloorPlanClick}
      networkDevices={networkDevices}
      networkDevicesVisibility={_networkDevicesVisibility}/></DndProvider>)

    await waitFor(() => {
      expect(screen.queryAllByTestId('fpImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('fpImage')[1]).toHaveAttribute('src',
        imageObj['7231da344778480d88f37f0cca1c534f-001.png'].signedUrl
      )
    })

    const images = screen.getAllByTestId('fpImage')
    fireEvent.click(images[1])

    expect(onFloorPlanClick).toBeCalledWith(list[1])
  })
})
