import '@testing-library/jest-dom'

import { act } from 'react-dom/test-utils'

import { AppIcon }                   from '@acx-ui/icons'
import { FloorPlanDto }              from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import PlainView, { getImageFitPercentage } from './PlainView'
import * as UI                              from './styledComponents'
import Thumbnail                            from './Thumbnail'

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

describe('Floor Plan Plain View', () => {

  it('should render correctly Plain View', async () => {

    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    expect(screen.queryByTestId('floorPlanImage')).toHaveAttribute('alt', list[0]?.name)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should trigger onFloorPlanSelectionHandler', async () => {
    const onClick = jest.fn()
    render(<Thumbnail floorPlan={list[1]} active={0} onFloorPlanSelection={onClick}/>)
    const component = await screen.findByTestId('thumbnailBg')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(list[1])
  })
  it('test zoom in function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('image-zoom-in')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom out function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('image-zoom-out')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom fit function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('image-zoom-fit')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom original function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('image-zoom-original')
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('Check Gallary view Icon', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('galleryIcon')
    expect(component).toBeVisible()
    fireEvent.click(component)
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('Check onImageLoadFunction', async () => {
    const onImageLoadFunction = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}/></Provider>)
    const component = await screen.findByTestId('floorPlanImage')
    expect(component).toBeVisible()
    act(() => {
      component.dispatchEvent(new UIEvent('load'))
    })
    expect(onImageLoadFunction).toHaveBeenCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('On gallery icon click', async () => {
    const onGalleryIconClick = jest.fn()
    render(<UI.GallaryIcon
      data-testid='galleryIcon'
      onClick={() => onGalleryIconClick()}
      type='default'
      icon={<AppIcon />}
    />)
    expect(onGalleryIconClick).toBeCalledTimes(0)
    act(() => screen.getByTestId('galleryIcon').click())
    expect(onGalleryIconClick).toBeCalledTimes(1)
  })

  it('should run getImageFitPercentage function', async () => {
    expect(getImageFitPercentage(400, 600, 300, 400)).toBe(66.66666666666666)
    expect(getImageFitPercentage(400, 600, 700, 800)).toBe(0)
  })

})
