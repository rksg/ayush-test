import '@testing-library/jest-dom'

import { FloorPlanDto }                       from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import PlainView, { getImageFitPercentage } from './PlainView'
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

  beforeEach(() => {
    Object.defineProperty(HTMLImageElement.prototype, 'offsetWidth', { value: 300 })
    Object.defineProperty(HTMLImageElement.prototype, 'offsetHeight', { value: 400 })
    Object.defineProperty(HTMLDivElement.prototype, 'offsetWidth', { value: 1150 })
    Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', { value: 450 })
  })

  it('should render correctly Plain View', async () => {

    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    expect(screen.queryByTestId('floorPlanImage')).toHaveAttribute('alt', list[0]?.name)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should trigger onFloorPlanSelectionHandler', async () => {
    const onFloorPlanSelectionHandler = jest.fn()
    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    render(<Thumbnail
      key={0}
      floorPlan={list[0]}
      active={1}
      onFloorPlanSelection={onFloorPlanSelectionHandler()} />)
    const component = screen.getAllByTestId('thumbnailBg')[0]
    await fireEvent.click(component)
    await expect(onFloorPlanSelectionHandler).toBeCalled()
    expect(asFragment()).toMatchSnapshot()
  })
  it('test zoom-in button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByTestId('image-zoom-in')
    const floorPlanContainer = await screen.findByTestId('image-container')
    const actualWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(actualWidth).toBe('calc(100%)'))
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(125%)'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('test zoom-out button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
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

    expect(asFragment()).toMatchSnapshot()
  })

  it('test zoom original button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByTestId('image-zoom-original')
    const floorPlanContainer = await screen.findByTestId('image-container')
    window.getComputedStyle(floorPlanContainer).width = 'calc(75%)'
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(100%)'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('test zoom fit button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByTestId('image-zoom-fit')
    const floorPlanContainer = await screen.findByTestId('image-container')
    window.getComputedStyle(floorPlanContainer).width = 'calc(120%)'
    window.getComputedStyle(floorPlanContainer).height = 'calc(80%)'
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(26%)'))
    fireEvent.click(component)
    const zoomedHeight = window.getComputedStyle(floorPlanContainer).height
    await waitFor(() => expect(zoomedHeight).toBe('100%'))
    expect(asFragment()).toMatchSnapshot()
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
  })

  it('Should click delete button', async () => {
    const deleteHandler = jest.fn(() => jest.fn())

    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={deleteHandler}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByRole('button', { name: /Delete/i })
    fireEvent.click(component)
    expect(deleteHandler).toBeCalledTimes(1)
    expect(asFragment()).toMatchSnapshot()
  })

  it('Should load image', async () => {
    const onImageLoad = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
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
    expect(asFragment()).toMatchSnapshot()
  })

  it('should open gallery view', async () => {

    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={jest.fn()}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}
      onAddEditFloorPlan={jest.fn()}/></Provider>)
    const button = screen.getByRole('button', { name: /ApplicationsSolid.svg/i })
    fireEvent.click(button)
    expect(asFragment()).toMatchSnapshot()
  })

})

