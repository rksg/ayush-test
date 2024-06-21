import './type.d'
import React from 'react'

import { ReactCompareSlider, ReactCompareSliderDetailedProps } from 'react-compare-slider'

import * as UI from './styledComponents'

// https://react-compare-slider.vercel.app/?path=/docs/docs-api--docs
export type CompareSliderProps = typeof ReactCompareSliderDetailedProps & {
  style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
  width: '600px',
  height: '400px',
  border: '2px solid #BEBEBE',
  borderRadius: '5px'
}

const CircleWithArrows = () => {
  return <UI.CircleWrapper>
    <UI.LeftArrow />
    <UI.RightArrow />
  </UI.CircleWrapper>
}

const CustomHandle: React.FC = () => {
  return <UI.CustomHandleWrapper>
    <UI.LineStyleWrapper />
    <CircleWithArrows />
    <UI.LineStyleWrapper />
  </UI.CustomHandleWrapper>
}

export const CompareSlider = (props: CompareSliderProps) => {
  const { itemOne, itemTwo,
    disabled = false, portrait = false, boundsPadding = 0, position = 50,
    changePositionOnHover = false, keyboardIncrement = 0, onlyHandleDraggable = true,
    style = defaultStyle
  } = props
  return (
    <div style={style}>
      <ReactCompareSlider
        handle={<CustomHandle />}
        itemOne={itemOne}
        itemTwo={itemTwo}
        disabled={disabled}
        portrait={portrait}
        boundsPadding={boundsPadding}
        position={position}
        changePositionOnHover={changePositionOnHover}
        keyboardIncrement={keyboardIncrement}
        onlyHandleDraggable={onlyHandleDraggable}
      />
    </div>
  )
}