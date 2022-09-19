import '@testing-library/jest-dom'

import { useEffect, useState } from 'react'

import { FloorPlanDto }   from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import GalleryView from './GalleryView'

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

describe('Floor Plan Gallery View', () => {

  it('should render correctly Gallery View', async () => {

    const { asFragment } = render(<GalleryView floorPlans={list} onFloorPlanClick={jest.fn()}/>)
    const component = await screen.findAllByTestId('fpImage')
    expect(component.length).toEqual(list.length)
    expect(asFragment()).toMatchSnapshot()
  })

  it('Test useState for span', async () => {
    const Component = () => {
      const [span, setSpan] = useState(12)
      useEffect(() => {
        (list?.length > 4) ? setSpan(8) : setSpan(12)
      }, [])
    
      return <>
        <GalleryView floorPlans={list} onFloorPlanClick={jest.fn()}/>
        <span>state: {String(span)}</span>
      </>
    }
    render(<Component />)

    expect(await screen.findByText('state: 12')).toBeVisible()
  })

})
