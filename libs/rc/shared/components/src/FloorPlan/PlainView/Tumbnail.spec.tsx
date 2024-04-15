import { ApDeviceStatusEnum, FloorPlanDto, NetworkDeviceType, SwitchStatusEnum, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { fireEvent, mockServer, render, screen, waitFor }                                                from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
// eslint-disable-next-line import/order
import { rest } from 'msw'

import Thumbnail from './Thumbnail'

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

const networkDeviceType: NetworkDeviceType[] = []

const imageObj = { '01acff37331949c686d40b5a00822ec2-001.jpeg': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/01acff37331949c686d40b5a00822ec2-001.jpeg'
},
'7231da344778480d88f37f0cca1c534f-001.png': {
  // eslint-disable-next-line max-len
  signedUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/tenant/fe892a451d7a486bbb3aee929d2dfcd1/7231da344778480d88f37f0cca1c534f-001.png'
}
}

describe('Floor Plan Thumbnail Image', () => {
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
  })

  it('should render correctly', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Thumbnail
      floorPlan={floorPlan}
      active={0}
      onFloorPlanSelection={onClick}
      networkDevices={networkDevices}
      networkDevicesVisibility={networkDeviceType}/>)
    await screen.findByText(floorPlan?.name)
    expect(screen.getByText(floorPlan?.name).textContent).toBe(floorPlan?.name)
    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src',
        imageObj['01acff37331949c686d40b5a00822ec2-001.jpeg'].signedUrl)
    })
    expect(screen.getByRole('img')).toBeVisible()
    const component = screen.getByTestId('thumbnailBg')
    fireEvent.click(component)
    expect(onClick).toBeCalled()
    expect(asFragment()).toMatchSnapshot()
  })

})
