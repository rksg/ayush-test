import { ComponentStory } from '@storybook/react'
import { scalePow }       from 'd3-scale'

import { Graph, deriveInterfering } from '@acx-ui/components'
import { BandEnum }                 from '@acx-ui/components'

import { CompareSlider, CompareSliderProps } from '..'
import { sample }                            from '../__tests__/fixtures'

import { ComponentOne, ComponentTwo } from './CustomComponents'


const story = {
  title: 'CompareSlider',
  component: CompareSlider
}
export default story

const Template: ComponentStory<typeof CompareSlider> = (props: CompareSliderProps) => {
  return (
    <CompareSlider {...props} />
  )
}

export const Default = Template.bind({})
Default.args = {
  itemOne:
    <img alt='ImageOne'
      // eslint-disable-next-line max-len
      src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-1.jpg'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    />,
  itemTwo:
    <img alt='ImageTwo'
      // eslint-disable-next-line max-len
      src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-2.jpg'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    />
}

export const TwoComponents = Template.bind({})
TwoComponents.args = {
  style: {
    width: '270px',
    height: '178px'
  },
  itemOne: <ComponentOne />,
  itemTwo: <ComponentTwo />,
  disabled: false,
  portrait: false,
  boundsPadding: 0,
  position: 50,
  changePositionOnHover: false,
  keyboardIncrement: 0,
  onlyHandleDraggable: false
}

const zoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500, 750])
  .range([1.75, 0.6, 0.4, 0.35, 0.2, 0.15, 0.11, 0.09, 0.075, 0.06])

export const TwoGraphs = Template.bind({})
TwoGraphs.args = {
  ...TwoComponents.args,
  style: {
    width: 1100,
    border: '2px solid #0000FF'
  },
  circleStyle: {
    backgroundColor: 'yellow'
  },
  lineStyle: {
    backgroundColor: 'green'
  },
  itemOne:
    <Graph
      chartRef={() => { }}
      title='Current'
      data={deriveInterfering(sample, BandEnum._5_GHz)}
      zoomScale={zoomScale}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 1100
      }}
    />,
  itemTwo:
    <Graph
      chartRef={() => { }}
      title='Future'
      data={deriveInterfering({ ...sample, interferingLinks: [] }, BandEnum._5_GHz)}
      zoomScale={zoomScale}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 1100
      }}
    />
}
