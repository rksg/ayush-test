import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, FloorPlanDto }                                     from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import FloorPlan from '.'

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
      )
    )
    params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
  })
  it('Floor Plans should render correctly', async () => {

    const { asFragment } = await render(<Provider><FloorPlan /></Provider>, {
      route: { params, path: '/:tenantId/venue/:venueId/floor-plan' }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    const plainViewImage = await screen.findAllByTestId('floorPlanImage')
    const thumbnailImages = screen.getAllByTestId('thumbnailBg')
    await expect(plainViewImage).toHaveLength(1)
    expect(thumbnailImages).toHaveLength(list.length)
    await screen.findByText('+ Add Floor Plan')

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    await screen.findByText('Are you sure you want to delete this Floor Plan?')

    const deleteFloorplanButton = await screen.findByText('Delete Floor Plan')
    fireEvent.click(deleteFloorplanButton)

    fireEvent.click(screen.getByRole('button', { name: /ApplicationsSolid.svg/i }))
    expect(plainViewImage[0]).not.toBeInTheDocument()
    expect(thumbnailImages[0]).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByTestId('fpImage')[0])
    await expect(await screen.findAllByTestId('floorPlanImage')).toHaveLength(1)

    expect(asFragment()).toMatchSnapshot()
  })
})
