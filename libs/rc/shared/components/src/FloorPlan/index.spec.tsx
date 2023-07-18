import '@testing-library/jest-dom'
import { rest }         from 'msw'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { act }          from 'react-dom/test-utils'

import { useIsSplitOn }                                                                          from '@acx-ui/feature-toggle'
import { ApDeviceStatusEnum, CommonUrlsInfo, FloorPlanDto, NetworkDeviceType, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved }             from '@acx-ui/test-utils'

import { FloorPlan, sortByFloorNumber } from '.'


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

const deviceData = {
  fields: [
    // eslint-disable-next-line max-len
    'serialNumber','xPercent','yPercent','switchName','name','rogueCategory','apMac','id','floorplanId','deviceStatus'],
  totalCount: 5,
  page: 1,
  data: [
    {
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
        deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
        floorplanId: '',
        id: '931704001509',
        name: 'R510-ROOT',
        serialNumber: '931704001509',
        xPercent: 0,
        yPercent: 0,
        networkDeviceType: NetworkDeviceType.ap
      },
      {
        deviceStatus: ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
        floorplanId: '',
        id: '302002015732',
        name: '3 02002015736',
        serialNumber: '302002015732',
        xPercent: 65.20548,
        yPercent: 9.839357,
        networkDeviceType: NetworkDeviceType.rogue_ap
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
  ]
}

const venueRogueAp = {
  enabled: true,
  reportThreshold: 0,
  roguePolicyId: '9700ca95e4be4a22857f0e4b621a685f'
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

const meshApList = {
  fields: [],
  totalCount: 4,
  page: 1,
  data: [
    {
      serialNumber: '931704001509',
      name: 'R510-ROOT',
      model: 'R510',
      fwVersion: '6.2.1.103.2538',
      venueId: '101988f2bbcd431884de9a7e6a5875c4',
      venueName: 'Mesh_setup',
      deviceStatus: '2_00_Operational',
      IP: '10.174.116.170',
      apMac: '0C:F4:D5:27:3B:90',
      apStatusData: {},
      meshRole: 'RAP',
      deviceGroupId: '24d56c947b924a6a9ec001f2d9f414f7',
      deviceGroupName: '',
      poePort: '0',
      healthStatus: 'Excellent'
    }
  ]
}

describe('Floor Plans', () => {
  let params: { tenantId: string, venueId: string }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenueFloorplans.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.delete(
        CommonUrlsInfo.deleteFloorPlan.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      ),
      rest.put(
        CommonUrlsInfo.updateFloorplan.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CommonUrlsInfo.getAllDevices.url,
        (req, res, ctx) => res(ctx.json(deviceData))
      ),
      rest.get(
        CommonUrlsInfo.getVenueRogueAp.url,
        (req, res, ctx) => res(ctx.json(venueRogueAp))
      ),
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          const { imageId } = req.params as { imageId: keyof typeof imageObj }
          return res(ctx.json({ ...imageObj[imageId], imageId }))
        }
      )
    )
    params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
  })
  it('Floor Plans should render correctly', async () => {

    const { asFragment } = await render(<Provider><DndProvider backend={HTML5Backend}><FloorPlan />
    </DndProvider></Provider>, {
      route: { params, path: '/:tenantId/venue/:venueId/floor-plan' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

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

    expect(asFragment()).toMatchSnapshot()

    const plainViewImage = await screen.findAllByTestId('floorPlanImage')
    const thumbnailImages = screen.getAllByTestId('thumbnailBg')
    await expect(plainViewImage).toHaveLength(1)
    expect(thumbnailImages).toHaveLength(list.length)
    await screen.findByText('+ Add Floor Plan')

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    await screen.findByText('Are you sure you want to delete this Floor Plan?')

    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    await screen.findByText('Edit Floor Plan')

    const editForm: HTMLFormElement = await screen.findByTestId('floor-plan-form')
    await act(() => {
      editForm.submit()
    })

    const deleteFloorplanButton = await screen.findByText('Delete Floor Plan')
    fireEvent.click(deleteFloorplanButton)

    fireEvent.click(await screen.findByTestId('ApplicationsSolid'))
    expect(plainViewImage[0]).not.toBeInTheDocument()
    expect(thumbnailImages[0]).not.toBeInTheDocument()

    expect(await screen.findByTestId('EyeOpenOutlined')).toBeInTheDocument()
    fireEvent.click(await screen.findByTestId('EyeOpenOutlined'))

  })

  it('Floor Plans should render gallery correctly', async () => {

    const { asFragment } = await render(<Provider><DndProvider backend={HTML5Backend}><FloorPlan />
    </DndProvider></Provider>, {
      route: { params, path: '/:tenantId/venue/:venueId/floor-plan' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

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

    const plainViewImage = await screen.findAllByTestId('floorPlanImage')
    const thumbnailImages = screen.getAllByTestId('thumbnailBg')
    await expect(plainViewImage).toHaveLength(1)
    expect(thumbnailImages).toHaveLength(list.length)

    fireEvent.click(await screen.findByTestId('ApplicationsSolid'))
    expect(plainViewImage[0]).not.toBeInTheDocument()
    expect(thumbnailImages[0]).not.toBeInTheDocument()


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

    expect(asFragment()).toMatchSnapshot()

    const fpImage = await screen.findAllByTestId('fpImage')
    expect(fpImage[0]).toBeVisible()

    fireEvent.click(await fpImage[0])
    expect(fpImage[0]).not.toBeVisible()
    fireEvent.click(await fpImage[1])
  })
  it('test sortByFloorNumber function', async () => {
    expect(sortByFloorNumber(list[1], list[0])).toEqual(1)
    expect(sortByFloorNumber(list[0], list[1])).toEqual(-1)
    expect(sortByFloorNumber(list[0], { ...list[1], floorNumber: 0 })).toEqual(0)
  })

  it('should render unplaced AP with mesh role', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...meshApList }))
      )
    )

    render(<Provider><DndProvider backend={HTML5Backend}><FloorPlan />
    </DndProvider></Provider>, {
      route: { params, path: '/:tenantId/venue/:venueId/floor-plan' }
    })

    const unplacedDevicesCount = deviceData.data[0].ap.filter(ap => !ap.floorplanId).length

    // eslint-disable-next-line max-len
    fireEvent.click(await screen.findByRole('button', { name: 'Unplaced Devices (' + unplacedDevicesCount + ')' }))

    expect(await screen.findByText('R510-ROOT (R)')).toBeInTheDocument()
  })
})
