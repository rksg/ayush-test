import '@testing-library/jest-dom'

import { rest }         from 'msw'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { act }          from 'react-dom/test-utils'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { ApDeviceStatusEnum,
  ApMeshLink,
  CommonUrlsInfo,
  FloorPlanDto,
  getImageFitPercentage,
  NetworkDevice,
  NetworkDeviceType,
  SwitchStatusEnum,
  TypeWiseNetworkDevices
} from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { render, screen, fireEvent, waitFor, mockServer } from '@acx-ui/test-utils'

import { NetworkDeviceContext } from '..'
import UnplacedDevice           from '../UnplacedDevices/UnplacedDevice'

import {
  mockedApMeshTopologyData,
  mockedMeshFloorPlans,
  mockedMeshAps,
  mockedMeshNetworkDevices
} from './__tests__/fixtures'
import PlainView, { setUpdatedLocation } from './PlainView'
import Thumbnail                         from './Thumbnail'


jest.mock('../../ApMeshConnection', () => ({
  ...jest.requireActual('../../ApMeshConnection'),
  default: (props: { linkInfo: ApMeshLink }) => {
    return <div data-testid={props.linkInfo.to}></div>
  }
}))

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

const networkDeviceType: NetworkDeviceType[] = []

for (let deviceType in NetworkDeviceType) {
  if (deviceType === NetworkDeviceType.rogue_ap) {
    continue // rogue ap is not controlled(placed) by user
  }
  const _deviceType = deviceType as keyof typeof NetworkDeviceType
  const networkDevicetype = NetworkDeviceType[_deviceType] as NetworkDeviceType
  networkDeviceType.push(networkDevicetype)
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

describe('Floor Plan Plain View', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          const { imageId } = req.params as { imageId: keyof typeof imageObj }
          return res(ctx.json({ ...imageObj[imageId], imageId }))
        }
      )
    )
    Object.defineProperty(HTMLImageElement.prototype, 'offsetWidth', { value: 300 })
    Object.defineProperty(HTMLImageElement.prototype, 'offsetHeight', { value: 400 })
    Object.defineProperty(HTMLDivElement.prototype, 'offsetWidth', { value: 1150 })
    Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', { value: 450 })
  })

  it('should render correctly Plain View', async () => {

    const { asFragment } = render(<Provider><NetworkDeviceContext.Provider value={jest.fn()}>
      <DndProvider backend={HTML5Backend}>
        <PlainView floorPlans={list}
          toggleGalleryView={() => {}}
          defaultFloorPlan={list[0]}
          deleteFloorPlan={jest.fn()}
          onAddEditFloorPlan={jest.fn()}
          networkDevices={networkDevices}
          networkDevicesVisibility={networkDeviceType}
          setCoordinates={jest.fn()}/></DndProvider>
    </NetworkDeviceContext.Provider></Provider>)
    expect(screen.queryByTestId('floorPlanImage')).toHaveAttribute('alt', list[0]?.name)

    await waitFor(() => {
      expect(screen.queryAllByTestId('floorPlanImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('thumbnailBgImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('thumbnailBgImage')[1]).toHaveAttribute('src',
        imageObj['7231da344778480d88f37f0cca1c534f-001.png'].signedUrl
      )
    })

    const component = screen.getByRole('img', { name: 'TEST_2' })
    const onImageLoad = jest.fn()
    component.onload = onImageLoad
    await fireEvent.load(component)
    await expect(onImageLoad).toBeCalledTimes(1)

    expect(await screen.findByTestId('SignalUp')).toBeVisible()

    const src = await screen.findByTestId('SignalUp')
    const dst = await screen.findAllByTestId('dropContainer')

    fireEvent.dragStart(src)
    fireEvent.dragEnter(dst[0])
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dst[0])
    fireEvent.dragLeave(dst[0])
    fireEvent.dragEnd(src)


    expect(asFragment()).toMatchSnapshot()
  })

  it('should trigger onFloorPlanSelectionHandler', async () => {
    const onFloorPlanSelectionHandler = jest.fn()
    render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    render(<DndProvider backend={HTML5Backend}><Thumbnail
      key={0}
      floorPlan={list[0]}
      active={1}
      onFloorPlanSelection={onFloorPlanSelectionHandler()}
      networkDevices={networkDevices}
      networkDevicesVisibility={networkDeviceType}/></DndProvider>)
    const component = screen.getAllByTestId('thumbnailBg')[0]
    await fireEvent.click(component)
    await expect(onFloorPlanSelectionHandler).toBeCalled()
    const floorplanIdMismatch = screen.getAllByTestId('thumbnailBg')[1]
    await fireEvent.click(floorplanIdMismatch)
  })
  it('test zoom-in button', async () => {
    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByTestId('image-zoom-in')
    const floorPlanContainer = await screen.findByTestId('image-container')
    const actualWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(actualWidth).toBe('calc(100%)'))
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(125%)'))
  })

  it('test zoom-out button', async () => {
    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByTestId('image-zoom-out')
    const floorPlanContainer = await screen.findByTestId('image-container')
    const actualWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(actualWidth).toBe('calc(100%)'))
    fireEvent.click(component)
    const zoomedWidth75 = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth75).toBe('calc(75%)'))
    fireEvent.click(component)
    const zoomedWidth50 = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth50).toBe('calc(50%)'))
    fireEvent.click(component)
    const zoomedWidth25 = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth25).toBe('calc(25%)'))
    fireEvent.click(component)
    const smallWidthZoomed1 = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(smallWidthZoomed1).toBe('calc(10%)'))
    fireEvent.click(component)
    await waitFor(() => expect(smallWidthZoomed1).toBe('calc(10%)'))

    window.getComputedStyle(floorPlanContainer).width = 'calc(30%)'
    fireEvent.click(component)
    const smallWidthZoomed2 = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(smallWidthZoomed2).toBe('calc(10%)'))
  })

  it('test zoom original button', async () => {
    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByTestId('image-zoom-original')
    const floorPlanContainer = await screen.findByTestId('image-container')
    window.getComputedStyle(floorPlanContainer).width = 'calc(75%)'
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(100%)'))
  })

  it('test zoom fit button', async () => {
    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByTestId('image-zoom-fit')
    const floorPlanContainer = await screen.findByTestId('image-container')
    window.getComputedStyle(floorPlanContainer).width = 'calc(120%)'
    window.getComputedStyle(floorPlanContainer).height = 'calc(80%)'
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(26%)'))
    fireEvent.click(component)
  })

  it('should run getImageFitPercentage function', async () => {
    await expect(getImageFitPercentage(3,24,1150,23)).toBe(0)
    await expect(getImageFitPercentage(400, 600, 300, 400)).toBe(66.66666666666666)
    await expect(getImageFitPercentage(400, 600, 700, 800)).toBe(0)
    await expect(getImageFitPercentage(700, 600, 400, 800)).toBe(57.14285714285714)
    await expect(getImageFitPercentage(450, 700, 450, 730)).toBe(0)
    await expect(getImageFitPercentage(4, 700, 1200, 730)).toBe(0)
    await expect(getImageFitPercentage(450, 3, 450, 1100)).toBe(0)
    await expect(getImageFitPercentage(0, 0, 450, 0)).toBe(0)
    await expect(getImageFitPercentage(-3,24,1150,23)).toBe(-0.26086956521739135)
    await expect(getImageFitPercentage(3,-24,1150,28)).toBe(-85.71428571428571)
    await expect(getImageFitPercentage(0,0,0,0)).toBe(0)
  })

  it('Should click delete button', async () => {
    const deleteHandler = jest.fn(() => jest.fn())

    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={deleteHandler}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByRole('button', { name: /Delete/i })
    fireEvent.click(component)
    expect(deleteHandler).toBeCalledTimes(1)
  })

  it('Should click edit button', async () => {
    const editHandler = jest.fn()

    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={editHandler}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = await screen.findByRole('button', { name: /Edit/i })
    await fireEvent.click(component)
    const editForm: HTMLFormElement = await screen.findByTestId('floor-plan-form')
    await act(() => {
      editForm.submit()
    })
    await expect(editHandler).toBeCalledTimes(1)
  })

  it('Should load image', async () => {
    const onImageLoad = jest.fn()
    await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)
    const component = screen.getByRole('img', { name: 'TEST_2' })
    component.onload = onImageLoad
    await fireEvent.load(component)
    await expect(onImageLoad).toBeCalledTimes(1)
    const component1 = screen.getByRole('img', { name: 'TEST_2' })
    window.getComputedStyle(component1).width='1250'
    await fireEvent.load(component1)
    const component2 = screen.getByRole('img', { name: 'TEST_2' })
    window.getComputedStyle(component2).width='1940'
    window.getComputedStyle(component2).height='1340'
    await fireEvent.load(component2)
    const component3 = screen.getByRole('img', { name: 'TEST_2' })
    window.getComputedStyle(component3).width='140'
    window.getComputedStyle(component3).height='140'
    await fireEvent.load(component3)
    const component4 = screen.getByRole('img', { name: 'TEST_2' })
    window.getComputedStyle(component4).width='860'
    window.getComputedStyle(component4).height='1840'
    await fireEvent.load(component4)
    Object.setPrototypeOf(HTMLImageElement.prototype.offsetWidth, { value: undefined })
    Object.setPrototypeOf(HTMLImageElement.prototype.offsetHeight, { value: undefined })
    const component5 = screen.getByRole('img', { name: 'TEST_2' })
    await fireEvent.load(component5)
  })

  it ('test setUpdatedLocation function', async () => {
    const positionedDevice: NetworkDevice =
    setUpdatedLocation(networkDevices['94bed28abef24175ab58a3800d01e24a']['ap'][0],
      { x: 122, y: 122 }, { x: 400, y: 240 })

    expect(positionedDevice.position?.x).toBe(122)
  })

  it('show single floorplan', async () => {

    const { asFragment } = render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={[list[0]]}
        toggleGalleryView={jest.fn()}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}
        showRogueAp={true}/></DndProvider></Provider>)

    await waitFor(() => {
      expect(screen.queryAllByTestId('floorPlanImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    const rogueHelpIcon = await screen.findByTestId('QuestionMarkCircleOutlined')
    expect(rogueHelpIcon).toBeVisible()
    fireEvent.click(rogueHelpIcon)

    expect(asFragment()).toMatchSnapshot()
  })

  it('drag new AP', async () => {

    const { asFragment } = await render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={list}
        toggleGalleryView={() => {}}
        defaultFloorPlan={list[0]}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={networkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/></DndProvider></Provider>)

    await waitFor(() => {
      expect(screen.queryAllByTestId('floorPlanImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })
    await waitFor(() => {
      expect(screen.queryAllByTestId('thumbnailBgImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })
    await waitFor(() => {
      expect(screen.queryAllByTestId('thumbnailBgImage')[1]).toHaveAttribute('src',
        imageObj['7231da344778480d88f37f0cca1c534f-001.png'].signedUrl
      )
    })

    const component = screen.getByRole('img', { name: 'TEST_2' })
    const onImageLoad = jest.fn()
    component.onload = onImageLoad
    await fireEvent.load(component)
    await expect(onImageLoad).toBeCalledTimes(1)

    expect(await screen.findByTestId('SignalUp')).toBeVisible()

    const dst = await screen.findAllByTestId('dropContainer')
    await render(<DndProvider backend={HTML5Backend}><UnplacedDevice
      device={networkDevices['94bed28abef24175ab58a3800d01e24a'].ap[0]}/></DndProvider>)
    const src = await screen.findAllByTestId('SignalUp')

    fireEvent.dragStart(src[1])
    fireEvent.dragEnter(dst[0])
    await new Promise((resolve) => setTimeout(resolve, 100))
    fireEvent.drop(dst[0])
    fireEvent.dragLeave(dst[0])
    fireEvent.dragEnd(src[1])

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly Plain View with AP Mesh Topology enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getMeshAps.url.replace('?mesh=true', ''),
        (req, res, ctx) => res(ctx.json({ ...mockedMeshAps }))
      ),
      rest.get(
        CommonUrlsInfo.getApMeshTopology.url,
        (req, res, ctx) => {
          return res(ctx.json({ ...mockedApMeshTopologyData }))
        }
      )
    )

    const targetFloorPlan = mockedMeshFloorPlans[0]
    const targetMeshLink = mockedApMeshTopologyData.data[0].edges[0]

    render(<Provider><DndProvider backend={HTML5Backend}>
      <PlainView floorPlans={mockedMeshFloorPlans}
        toggleGalleryView={() => {}}
        defaultFloorPlan={targetFloorPlan}
        deleteFloorPlan={jest.fn()}
        onAddEditFloorPlan={jest.fn()}
        networkDevices={mockedMeshNetworkDevices}
        networkDevicesVisibility={networkDeviceType}
        setCoordinates={jest.fn()}/>
    </DndProvider></Provider>, {
      route: {
        params: { tenantId: '__Tenant__', venueId: '__Venue__' },
        path: '/:tenantId/:venueId'
      }
    })

    await waitFor(() => {
      expect(screen.queryAllByTestId('floorPlanImage')[0]).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl
      )
    })

    await fireEvent.load(screen.getByRole('img', { name: targetFloorPlan.name }))

    expect(await screen.findByTestId('APMeshRoleRoot')).toBeVisible()
    expect(await screen.findByTestId('APMeshRoleMesh')).toBeVisible()
    expect(await screen.findByTestId(targetMeshLink.to)).toBeInTheDocument()

    await fireEvent.click(await screen.findByRole('switch'))

    await waitFor(() => {
      expect(screen.queryByTestId('APMeshRoleRoot')).toBeNull()
    })
  })
})

