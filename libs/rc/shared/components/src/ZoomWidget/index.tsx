import { RefObject, useState } from 'react'

import { Button }      from '@acx-ui/components'
import {
  MagnifyingGlassMinusOutlined,
  MagnifyingGlassPlusOutlined,
  SearchFitOutlined,
  SearchFullOutlined
} from '@acx-ui/icons'
import { getImageFitPercentage } from '@acx-ui/rc/utils'

import { ImageMode } from '../FloorPlan/PlainView/PlainView'
import * as UI       from '../FloorPlan/PlainView/styledComponents'

interface ZoomWidgetProps {
  imageRef: RefObject<HTMLImageElement>,
  imageContainerRef: RefObject<HTMLDivElement>,
  imageMode: ImageMode,
  setImageMode: React.Dispatch<React.SetStateAction<ImageMode>>,
  currentZoom: number,
  setCurrentZoom: React.Dispatch<React.SetStateAction<number>>,
  style?: React.CSSProperties
}

export function ZoomWidget (props: ZoomWidgetProps) {
  const {
    imageRef, imageContainerRef,
    imageMode = ImageMode.ORIGINAL, setImageMode,
    currentZoom = 1, setCurrentZoom,
    style
  } = props
  const [fitContainerSize, setFitContainerSize] = useState(0)

  function fitFloorplanImage () {
    if (imageMode !== ImageMode.FIT) {
      const containerCoordsX = imageContainerRef?.current?.parentElement?.offsetWidth || 0
      const containerCoordsY = imageContainerRef?.current?.parentElement?.offsetHeight || 0

      const imageCoordsX = imageRef?.current?.offsetWidth || 0
      const imageCoordsY = imageRef?.current?.offsetHeight || 0


      const differencePercentage = getImageFitPercentage(containerCoordsX,
        containerCoordsY, imageCoordsX, imageCoordsY)

      if (differencePercentage) {
        const _zoom = Math.floor(differencePercentage) / 100
        setCurrentZoom(_zoom)
        setFitContainerSize(_zoom)
        setImageMode(ImageMode.FIT)
      }
    }
  }

  function setImageModeHandler (mode: ImageMode) {
    switch (mode) {
      case ImageMode.ZOOM_IN:
        if (currentZoom < 5) {
          const calculatedZoom = currentZoom + 0.25
          setCurrentZoom(calculatedZoom)
        }
        break
      case ImageMode.ZOOM_OUT:
        if (currentZoom > 0.1) {
          if (currentZoom > 0.25) {
            const newZoomVal = currentZoom - 0.25
            const calculatedZoom = (newZoomVal < 0.1) ? 0.1 : newZoomVal
            setCurrentZoom(calculatedZoom)
          } else {
            setCurrentZoom(0.1)
          }
        }
        break
      case ImageMode.ORIGINAL:
        setCurrentZoom(1)
        break
      case ImageMode.FIT:
        if (!fitContainerSize) {
          fitFloorplanImage()
        } else {
          setCurrentZoom(fitContainerSize)
        }
        break
    }
    setImageMode(mode)
  }

  return <UI.ImageButtonsContainer
    style={style ?? {}}
    alignbottom={1}>
    <Button
      data-testid='image-zoom-in'
      onClick={() => setImageModeHandler(ImageMode.ZOOM_IN)}
      type='link'
      size='middle'
      icon={<MagnifyingGlassPlusOutlined />} />
    <Button
      data-testid='image-zoom-out'
      onClick={() => setImageModeHandler(ImageMode.ZOOM_OUT)}
      type='link'
      size='middle'
      icon={<MagnifyingGlassMinusOutlined />} />
    <Button
      data-testid='image-zoom-original'
      onClick={() => setImageModeHandler(ImageMode.ORIGINAL)}
      size='middle'
      type='link'
      icon={<SearchFullOutlined />} />
    <Button
      data-testid='image-zoom-fit'
      onClick={() => setImageModeHandler(ImageMode.FIT)}
      size='middle'
      type='link'
      icon={<SearchFitOutlined />}/>
  </UI.ImageButtonsContainer>
}
