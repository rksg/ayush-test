import { useEffect, useState } from 'react'

import { ScalePower } from 'd3'
import { scalePow }   from 'd3-scale'
import { connect }    from 'echarts'
import ReactECharts   from 'echarts-for-react'
import { useIntl }    from 'react-intl'
import AutoSizer      from 'react-virtualized-auto-sizer'

import {
  Card,
  Drawer,
  DrawerTypes,
  Graph as BasicGraph,
  ProcessedCloudRRMGraph,
  bandwidthMapping
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { intentBandMapping } from '../config'
import { EnhancedIntent }    from '../IntentAIForm/services'

import { Legend } from './Legend'
import * as UI    from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  intent: EnhancedIntent,
  legend: string[],
  zoomScale: ScalePower<number, number, never>,
  isDrawer: boolean,
  summaryUrlBefore?: string,
  summaryUrlAfter?: string
) {
  const { $t } = useIntl()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
    }
  }
  useEffect(() => { connect('graphGroup') }, [])

  const beforeGraph = <div key='crrm-graph-before'><AutoSizer>{({ height, width }) => <BasicGraph
    style={{ width, height }}
    chartRef={connectChart}
    title={$t({ defaultMessage: 'Before' })}
    subtext={$t({ defaultMessage: 'As at {dateTime}' }, {
      dateTime: formatter(DateFormatEnum.DateTimeFormat)(intent.dataEndTime)
    })}
    data={graphs[0]}
    zoomScale={zoomScale}
  />}</AutoSizer></div>
  const beforeImage = <img
    key={'crrm-graph-before-image'}
    src={summaryUrlBefore}
    alt='summary-before'
    width={'100%'}
    height={'100%'}
  />
  const afterGraph = <div key='crrm-graph-after'><AutoSizer>{({ height, width }) => <BasicGraph
    style={{ width, height }}
    chartRef={connectChart}
    title={$t({ defaultMessage: 'Recommended' })}
    data={graphs[1]}
    zoomScale={zoomScale}
  />}</AutoSizer></div>
  const afterImage = <img
    key={'crrm-graph-after-image'}
    src={summaryUrlAfter}
    alt='summary-after'
    width={'100%'}
    height={'100%'}
  />

  return (graphs?.length)
    ? [ isDrawer ? beforeGraph : beforeImage,
      ...(!isDrawer ? [<div key='crrm-arrow' style={{ display: 'flex', alignItems: 'center' }}>
        <UI.RightArrow/>
      </div>] : []),
      isDrawer ? afterGraph : afterImage,
      ...(legend?.length ? [<Legend key='crrm-graph-legend' bandwidths={legend}/>] : [])
    ]
    : null
}

const detailsZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500])
  .range([1, 0.45, 0.3, 0.25, 0.135, 0.1, 0.075, 0.06, 0.05])
const drawerZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.07])

export const IntentAIRRMGraph = ({
  details, crrmData, summaryUrlBefore, summaryUrlAfter } : {
    details: EnhancedIntent,
    crrmData: ProcessedCloudRRMGraph[],
    summaryUrlBefore?: string,
    summaryUrlAfter?: string
  }) => {
  const { $t } = useIntl()
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const band = intentBandMapping[details.code as keyof typeof intentBandMapping]
  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom
  return <UI.Wrapper>
    <Card>
      <UI.GraphWrapper children={
        useGraph(
          crrmData, details, bandwidthMapping[band],
          detailsZoomScale, false, summaryUrlBefore, summaryUrlAfter)
      } />
    </Card>
    <UI.ViewMoreButton onClick={showDrawer} children={$t({ defaultMessage: 'View More' })} />
    <Drawer
      key={key}
      drawerType={DrawerTypes.FullHeight}
      width={'90vw'}
      title={title}
      visible={visible}
      onClose={closeDrawer}
      children={
        <UI.DrawerGraphWrapper>
          {useGraph(
            crrmData,
            details,
            bandwidthMapping[band],
            drawerZoomScale,
            true
          )}
        </UI.DrawerGraphWrapper>
      }/>
  </UI.Wrapper>
}

export const SliderGraphBefore = (
  { crrmData, setSliderUrlBefore }:
  { crrmData: ProcessedCloudRRMGraph[], setSliderUrlBefore: (url: string) => void }) => {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSliderUrlBefore(url)
    }
  }
  return (
    <div key='crrm-slider-before'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      {crrmData[0] && <BasicGraph
        chartRef={connectChart}
        title={''}
        data={crrmData[0]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 300
        }}
        backgroundColor='#333333'
      />}
    </div>
  )
}

export const SliderGraphAfter = (
  { crrmData, setSliderUrlAfter }:
  { crrmData: ProcessedCloudRRMGraph[], setSliderUrlAfter: (url: string) => void }) => {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSliderUrlAfter(url)
    }
  }
  return (
    <div key='crrm-slider-after'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'end'
      }}>
      {crrmData[1] && <BasicGraph
        chartRef={connectChart}
        title={''}
        data={crrmData[1]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 300
        }}
      />}
    </div>
  )
}

export const SummaryGraphBefore = (
  { details, crrmData, setSummaryUrlBefore, detailsPage = false }:
  { details: EnhancedIntent,
    crrmData: ProcessedCloudRRMGraph[],
    detailsPage?: boolean,
    setSummaryUrlBefore: (url: string) => void }) => {
  const { $t } = useIntl()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSummaryUrlBefore(url)
    }
  }
  return (
    <div key='crrm-graph-before'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      {crrmData[0] && <BasicGraph
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Before' })}
        subtext={$t({ defaultMessage: 'As at {dateTime}' }, {
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(details.dataEndTime)
        })}
        data={crrmData[0]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: detailsPage ? 350 : 250
        }}
        backgroundColor='transparent'
      />}
    </div>
  )
}

export const SummaryGraphAfter = (
  { crrmData, setSummaryUrlAfter, detailsPage = false }:
  { crrmData: ProcessedCloudRRMGraph[],
    detailsPage?: boolean,
    setSummaryUrlAfter: (url: string) => void }) => {
  const { $t } = useIntl()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSummaryUrlAfter(url)
    }
  }
  return (
    <div key='crrm-graph-after'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      {crrmData[1] && <BasicGraph
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Recommended' })}
        data={crrmData[1]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: detailsPage ? 350 : 250
        }}
        backgroundColor='transparent'
      />}
    </div>
  )
}
