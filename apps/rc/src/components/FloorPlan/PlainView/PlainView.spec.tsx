import '@testing-library/jest-dom'

import { FloorPlanDto }                       from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import PlainView, { getImageFitPercentage } from './PlainView'

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
    // TODO cover fitFloorplanImage with different offsets
    Object.defineProperty(Element.prototype, 'offsetWidth', { value: undefined })
    Object.defineProperty(Element.prototype, 'offsetHeight', { value: undefined })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { value: undefined })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { value: undefined })
  })

  it('should render correctly Plain View', async () => {

    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}/></Provider>)
    expect(screen.queryByTestId('floorPlanImage')).toHaveAttribute('alt', list[0]?.name)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should trigger onFloorPlanSelectionHandler', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findAllByTestId('thumbnailBg')
    fireEvent.click(component[0])
    expect(asFragment()).toMatchSnapshot()
  })
  it('test zoom-in button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}/></Provider>)
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
      deleteFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByTestId('image-zoom-out')
    const floorPlanContainer = await screen.findByTestId('image-container')
    const actualWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(actualWidth).toBe('calc(100%)'))
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(75%)'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('test zoom original button', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()}/></Provider>)
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
      deleteFloorPlan={jest.fn()}/></Provider>)
    const component = await screen.findByTestId('image-zoom-fit')
    const floorPlanContainer = await screen.findByTestId('image-container')
    window.getComputedStyle(floorPlanContainer).width = 'calc(120%)'
    fireEvent.click(component)
    const zoomedWidth = window.getComputedStyle(floorPlanContainer).width
    await waitFor(() => expect(zoomedWidth).toBe('calc(100%)'))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should run getImageFitPercentage function', async () => {
    expect(getImageFitPercentage(400, 600, 300, 400)).toBe(66.66666666666666)
    expect(getImageFitPercentage(400, 600, 700, 800)).toBe(0)
  })

  it('Should click delete button', async () => {
    const deleteHandler = jest.fn(() => jest.fn())

    const { asFragment } = await render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={() => {}}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={deleteHandler}/></Provider>)
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
      deleteFloorPlan={jest.fn()}/></Provider>)
    const component = screen.getByRole('img', { name: 'TEST_2' })
    component.onload = onImageLoad
    fireEvent.load(component)
    await expect(onImageLoad).toBeCalledTimes(1)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should open gallery view', async () => {

    const { asFragment } = render(<Provider><PlainView floorPlans={list}
      toggleGalleryView={jest.fn()}
      defaultFloorPlan={list[0]}
      deleteFloorPlan={jest.fn()} /></Provider>)
    const button = screen.getByRole('button', { name: /ApplicationsSolid.svg/i })
    fireEvent.click(button)
    expect(asFragment()).toMatchSnapshot()
  })

})

