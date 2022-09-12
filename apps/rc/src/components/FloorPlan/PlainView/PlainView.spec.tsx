import '@testing-library/jest-dom'

import { FloorPlanDto }              from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import PlainView from './PlainView'
import Thumbnail from './Thumbnail'


export enum ImageMode {
  FIT = 'fit',
  ZOOM_IN = '+',
  ZOOM_OUT = '-',
  ORIGINAL = 'original'
}

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

    const { asFragment } = render(<Provider><PlainView floorPlans={list}/></Provider>)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should show default Floor Plan Image', async () => {
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}/></Provider>)
    expect(screen.queryAllByTestId('floorPlanImage')[0]).toHaveAttribute('alt', list[0]?.name)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should trigger onFloorPlanSelectionHandler', async () => {
    const onClick = jest.fn()
    render(<Thumbnail floorPlan={list[1]} active={0} onFloorPlanSelection={onClick}/>)
    const component = await screen.findAllByTestId('thumbnailBg')
    fireEvent.click(component[0])
    expect(onClick).toBeCalledTimes(1)
  })
  it('test zoom in function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}/></Provider>)
    const component = await screen.findAllByTestId('image-zoom-in')
    fireEvent.click(component[0])
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom out function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}/></Provider>)
    const component = await screen.findAllByTestId('image-zoom-out')
    fireEvent.click(component[0])
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom fit function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}/></Provider>)
    const component = await screen.findAllByTestId('image-zoom-fit')
    fireEvent.click(component[0])
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

  it('test zoom original function', async () => {
    const onClick = jest.fn()
    const { asFragment } = await render(<Provider><PlainView floorPlans={list}/></Provider>)
    const component = await screen.findAllByTestId('image-zoom-original')
    fireEvent.click(component[0])
    expect(onClick).toBeCalledTimes(0)
    expect(asFragment).toMatchSnapshot()
  })

})
