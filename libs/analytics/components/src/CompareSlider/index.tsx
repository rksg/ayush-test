import './type.d'
import React from 'react'

import { ReactCompareSlider, ReactCompareSliderDetailedProps } from 'react-compare-slider'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

import * as UI from './styledComponents'

// https://react-compare-slider.vercel.app/?path=/docs/docs-api--docs
export type CompareSliderProps = typeof ReactCompareSliderDetailedProps & {
  style?: React.CSSProperties
  lineStyle?: React.CSSProperties
  circleStyle?: React.CSSProperties
}

type CustomHandleProps = {
  lineStyle: React.CSSProperties
  cirecleStyle: React.CSSProperties
}

const CustomHandle = (props: CustomHandleProps) => {
  return <div className='custom-handle'>
    <div className='handle-line' style={props.lineStyle ?? {}} />
    <div className='handle-circle' style={props.cirecleStyle ?? {}}>
      <ArrowChevronLeft className='arrow-left' />
      <ArrowChevronRight className='arrow-right' />
    </div>
    <div className='handle-line' style={props.lineStyle ?? {}} />
  </div>
}

export const CompareSlider = (props: CompareSliderProps) => {
  const { itemOne, itemTwo,
    disabled = false, portrait = false, boundsPadding = 0, position = 50,
    changePositionOnHover = false, keyboardIncrement = 0, onlyHandleDraggable = true,
    style, lineStyle, circleStyle
  } = props
  return (
    <UI.CompareSliderWrapper>
      <ReactCompareSlider className='compare-slider'
        style={style ?? {}}
        handle={<CustomHandle lineStyle={lineStyle} cirecleStyle={circleStyle} />}
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
    </UI.CompareSliderWrapper>
  )
}