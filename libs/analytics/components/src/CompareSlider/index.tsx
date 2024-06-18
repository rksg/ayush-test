import { ReactCompareSlider, ReactCompareSliderDetailedProps } from 'react-compare-slider'

// https://react-compare-slider.vercel.app/?path=/docs/docs-api--docs
export type CompareSliderProps = typeof ReactCompareSliderDetailedProps

export const CompareSlider = (props: CompareSliderProps) => {
  const { itemOne, itemTwo,
    disabled = false, portrait = false, boundsPadding = 0, position = 50,
    changePositionOnHover = false, keyboardIncrement = 0, onlyHandleDraggable = true
  } = props
  return (
    <ReactCompareSlider
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