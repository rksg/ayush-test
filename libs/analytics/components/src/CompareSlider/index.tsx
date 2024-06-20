import './type.d'
import { ReactCompareSlider, ReactCompareSliderDetailedProps } from 'react-compare-slider'
import * as UI from './styledComponents'

// https://react-compare-slider.vercel.app/?path=/docs/docs-api--docs
export type CompareSliderProps = typeof ReactCompareSliderDetailedProps

const Line = () => <div style={{
  height: '100%',
  width: '2px',
  backgroundColor: 'white',
  pointerEvents: 'auto',
}} />

const CircleWithArrows = () => {
  return <div style={{
    display: 'grid',
    gridAutoFlow: 'column',
    placeContent: 'center',
    flexShrink: 0,
    width: '56px',  //16
    height: '56px', //16
    borderRadius: '50%',
    pointerEvents: 'auto',
    backgroundColor: 'white',
  }}>
    <UI.LeftArrow />
    <UI.RightArrow />
  </div>
} 

const CustomHandle: React.FC = () => {
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    placeItems: 'center',
    height: '100%',
    cursor: 'ew-resize',
    pointerEvents: 'none',
    color: 'rgb(255, 255, 255)'
  }}>
    <Line />
    <CircleWithArrows />
    <Line />
  </div>
};

export const CompareSlider = (props: CompareSliderProps) => {
  const { itemOne, itemTwo,
    disabled = false, portrait = false, boundsPadding = 0, position = 50,
    changePositionOnHover = false, keyboardIncrement = 0, onlyHandleDraggable = true
  } = props
  return (
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
  )
}