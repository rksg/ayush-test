import { useIsSplitOn }                  from '@acx-ui/feature-toggle'
import {
  ApDetails, ApDeviceStatusEnum, ApPosition, CommonUrlsInfo,
  FloorPlanDto, NetworkDeviceType, SwitchStatusEnum,
  TypeWiseNetworkDevices, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

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

const apListData = {
  fields: [
    'clients','serialNumber','IP','apMac','apStatusData.APRadio.channel','deviceStatus','tags',
    'venueName','meshRole','apStatusData.APRadio.band','apStatusData.APRadio.radioId','switchName',
    'deviceGroupId','venueId','name','deviceGroupName','model','fwVersion'
  ],
  totalCount: 1,
  page: 1,
  data: [{
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    serialNumber: '932173000117',
    name: '350-11-69',
    model: 'R350',
    fwVersion: '6.2.0.103.513',
    venueId: '7231da344778480d88f37f0cca1c534f',
    venueName: '123roam',
    deviceStatus: '2_00_Operational',
    IP: '192.168.11.69',
    apMac: '58:FB:96:01:9A:30',
    apStatusData: {
      APRadio: [
        { txPower: null,channel: 9,band: '2.4G',Rssi: null,radioId: 0 },
        { txPower: null,channel: 40,band: '5G',Rssi: null,radioId: 1 }
      ]
    },
    meshRole: 'DISABLED',
    deviceGroupId: '48392c8c2eda43be90213e8dd09468fe',
    tags: '',
    deviceGroupName: ''
  }]
}

const mockedMeshAps = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '931704001509',
      name: 'R510-ROOT',
      apMac: '0C:F4:D5:27:3B:90',
      downlink: [],
      uplink: [],
      meshRole: 'RAP',
      hops: 0,
      floorplanId: floorPlan.id,
      xPercent: 79.716515,
      yPercent: 31.556149,
      downlinkCount: 2,
      healthStatus: 'Unknown'
    }
  ]
}

describe('AP floorplan', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
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
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(apListData))
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
          params, path: '/:tenantId/t/venue/:venueId/floor-plan',
          wrapRoutes: false
        }
      })
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl)
    })
    expect(screen.getByRole('img')).toBeVisible()
    fireEvent.load(screen.getByRole('img'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render floorplan with mesh info', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getMeshAps.url.replace('?mesh=true', ''),
        (req, res, ctx) => res(ctx.json({ ...mockedMeshAps }))
      ),
      rest.get(
        CommonUrlsInfo.getApMeshTopology.url,
        (req, res, ctx) => {
          return res(ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <ApFloorplan
          activeDevice={networkDevices['94bed28abef24175ab58a3800d01e24a'].ap[0]}
          venueId={params.venueId}
          apPosition={apDetails.position as ApPosition}
        />
      </Provider>, {
        route: {
          params, path: '/:tenantId/venue/:venueId/floor-plan',
          wrapRoutes: false
        }
      }
    )

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl)
    })
    fireEvent.load(screen.getByRole('img'))

    expect(await screen.findByTestId('APMeshRoleRoot')).toBeVisible()

    await fireEvent.click(await screen.findByRole('switch'))

    await waitFor(() => {
      expect(screen.queryByTestId('APMeshRoleRoot')).toBeNull()
    })

  })

})
