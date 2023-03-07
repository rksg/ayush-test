import { ApDetails, ApDeviceStatusEnum, ApPosition, CommonUrlsInfo, FloorPlanDto, NetworkDeviceType, SwitchStatusEnum, TypeWiseNetworkDevices, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                                                from '@acx-ui/test-utils'

import '@testing-library/jest-dom'

// eslint-disable-next-line import/order
import { rest }        from 'msw'
import { ApFloorplan } from '.'

const apDetails: ApDetails ={
  serialNumber: '422039000034',
  apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
  venueId: '7231da344778480d88f37f0cca1c534f',
  name: 'AP1',
  description: 'Ap',
  softDeleted: false,
  model: 'R650',
  updatedDate: '2022-11-15T08:37:42.987+0000',
  position: {
    positionX: 65.20548,
    positionY: 9.839357,
    floorplanId: '94bed28abef24175ab58a3800d01e24a'
  } as ApPosition
}


const floorPlan: FloorPlanDto = {
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

const imageObj = { '01acff37331949c686d40b5a00822ec2-001.jpeg': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/01acff37331949c686d40b5a00822ec2-001.jpeg'
},
'7231da344778480d88f37f0cca1c534f-001.png': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
}
}

const params = {
  tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
  venueId: '7231da344778480d88f37f0cca1c534f',
  floorplanId: '94bed28abef24175ab58a3800d01e24a'
}

describe('AP floorplan', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${window.location.origin}/files/:imageId/urls`,
        (req, res, ctx) => {
          const { imageId } = req.params as { imageId: keyof typeof imageObj }
          return res(ctx.json({ ...imageObj[imageId], imageId }))
        }
      ),
      rest.get(
        CommonUrlsInfo.getFloorplan.url,
        (_, res, ctx) => res(ctx.json(floorPlan))
      ),
      rest.get(
        WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(apDetails))
      )
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = await render(
      <Provider>
        <ApFloorplan
          activeDevice={networkDevices['94bed28abef24175ab58a3800d01e24a'].ap[0]}
          venueId={params.venueId}
          apPosition={apDetails.position as ApPosition}/></Provider>, {
        route: {
          params, path: '/:tenantId/venue/:venueId/floor-plan',
          wrapRoutes: false
        }
      })
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl)
    })
    expect(screen.getByRole('img')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

})
