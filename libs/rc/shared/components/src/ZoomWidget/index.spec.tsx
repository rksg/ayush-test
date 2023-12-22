import { createRef } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { ImageMode } from '../FloorPlan/PlainView/PlainView'

import { ZoomWidget } from './index'

describe('ZoomWidget', () => {
  it('render zoomWidget', async () => {
    const imageRef = createRef<HTMLImageElement>()
    const imageContainerRef = createRef<HTMLDivElement>()

    render(<div>
      <ZoomWidget
        imageRef={imageRef}
        imageContainerRef={imageContainerRef}
        imageMode={ImageMode.ORIGINAL}
        setImageMode={jest.fn()}
        currentZoom={1}
        setCurrentZoom={jest.fn()}
      />
      <img src={'imgSrc'} ref={imageRef} />
    </div>)

    await userEvent.click(await screen.findByTestId('image-zoom-in'))
    await userEvent.click(await screen.findByTestId('image-zoom-out'))
    await userEvent.click(await screen.findByTestId('image-zoom-original'))
    await userEvent.click(await screen.findByTestId('image-zoom-fit'))
  })
})
