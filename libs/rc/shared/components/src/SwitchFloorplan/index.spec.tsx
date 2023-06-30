import { ApDeviceStatusEnum, CommonUrlsInfo, FloorPlanDto, NetworkDevicePosition, NetworkDeviceType, SwitchStatusEnum, SwitchUrlsInfo, SwitchViewModel, SWITCH_TYPE, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor }                                                                                                                                     from '@acx-ui/test-utils'

import '@testing-library/jest-dom'

// eslint-disable-next-line import/order
import { rest } from 'msw'

import { SwitchFloorplan } from '.'

const switchDetail: SwitchViewModel = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: 'c0:c5:20:98:b9:67',
  switchName: 'ICX7150-C12 Router',
  model: 'ICX7150-C12P',
  id: 'c0:c5:20:98:b9:67',
  syncDataEndTime: '2023-01-16T06:07:09Z',
  firmwareVersion: 'SPR09010e',
  clientCount: 1,
  serialNumber: 'FEK3216Q05B',
  ipAddress: '10.206.33.13',
  cliApplied: false,
  subnetMask: '255.255.254.0',
  venueName: 'My-Venue',
  name: 'ICX7150-C12 Router',
  suspendingDeployTime: '',
  switchType: SWITCH_TYPE.ROUTER,
  configReady: true,
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  venueId: '7231da344778480d88f37f0cca1c534f',
  syncedSwitchConfig: true,
  defaultGateway: '10.206.33.254',
  stackMembers: [
    { model: 'ICX7150-C12P', id: 'FEK3216Q02P' },
    { model: 'ICX7150-C12P', id: 'FEK3216Q05B' }
  ],
  uptime: '7 days, 7:36:21.00',
  formStacking: false,
  floorplanId: '94bed28abef24175ab58a3800d01e24a'
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
      id: 'c0:c5:20:98:b9:67',
      name: 'ICX7150-C12 Router',
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

export const switchListData = {
  fields: [
    'suspendingDeployTime', 'serialNumber', 'syncedSwitchConfig', 'ipAddress',
    'check-all', 'configReady', 'cliApplied', 'isStack', 'syncDataStartTime',
    'deviceStatus', 'uptime', 'venueName', 'switchMac', 'formStacking', 'switchName',
    'operationalWarning', 'venueId', 'syncDataId', 'name', 'model', 'activeSerial',
    'cog', 'id', 'clientCount'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'c0:c5:20:98:b9:67',
      model: 'ICX7150-C12P',
      uptime: '20 days, 22 hours',
      switchName: 'ICX7150-C12 Router',
      serialNumber: 'FEK3224R08H',
      activeSerial: 'FEK3224R08H',
      ipAddress: '10.206.10.40',
      deviceStatus: 'ONLINE',
      switchMac: 'c0:c5:20:98:b9:67',
      isStack: false,
      name: 'ICX7150-C12 Router',
      venueId: '7231da344778480d88f37f0cca1c534f',
      venueName: 'My-Venue',
      clientCount: 1,
      configReady: true,
      syncedSwitchConfig: true,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: false,
      suspendingDeployTime: ''
    }
  ]
}

describe('Switch floorplan', () => {

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
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetail))
      ),
      rest.post(
        SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json(switchListData))
      )
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = await render(
      <Provider>
        <SwitchFloorplan
          activeDevice={networkDevices['94bed28abef24175ab58a3800d01e24a'].switches[0]}
          venueId={params.venueId}
          switchPosition={{
            xPercent: switchDetail.xPercent,
            yPercent: switchDetail.yPercent,
            floorplanId: switchDetail.floorplanId
          } as NetworkDevicePosition}/></Provider>, {
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
    fireEvent.load(screen.getByRole('img'))
    expect(asFragment()).toMatchSnapshot()
  })

})
