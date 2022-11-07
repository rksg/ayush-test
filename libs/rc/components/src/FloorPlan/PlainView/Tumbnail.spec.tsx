import { FloorPlanDto }              from '@acx-ui/rc/utils'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import '@testing-library/jest-dom'
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

describe('Floor Plan Thumbnail Image', () => {

  it('should render correctly', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Thumbnail
      floorPlan={floorPlan}
      active={0}
      onFloorPlanSelection={onClick}/>)
    await screen.findByText(floorPlan?.name)
    expect(screen.getByText(floorPlan?.name).textContent).toBe(floorPlan?.name)
    expect(screen.getByRole('img')).toHaveAttribute('src', floorPlan?.imageUrl)
    expect(screen.getByRole('img')).toBeVisible()
    const component = screen.getByTestId('thumbnailBg')
    fireEvent.click(component)
    expect(onClick).toBeCalled()
    expect(asFragment()).toMatchSnapshot()
  })

})
