import { useEffect, useState } from 'react'

import { ScalePower } from 'd3'
import { scalePow }   from 'd3-scale'
import { connect }    from 'echarts'
import ReactECharts   from 'echarts-for-react'
import { useIntl }    from 'react-intl'
import AutoSizer      from 'react-virtualized-auto-sizer'

import { kpiDelta }  from '@acx-ui/analytics/utils'
import {
  Card,
  Drawer,
  DrawerTypes,
  Graph as BasicGraph,
  ProcessedCloudRRMGraph,
  recommendationBandMapping,
  bandwidthMapping
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { EnhancedRecommendation } from '../IntentAIForm/services'

import { Legend } from './Legend'
import * as UI    from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  recommendation: EnhancedRecommendation,
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
      dateTime: formatter(DateFormatEnum.DateTimeFormat)(recommendation.dataEndTime)
    })}
    data={graphs[0]}
    zoomScale={zoomScale}
  />}</AutoSizer></div>
  const beforeImage = <img src={summaryUrlBefore} alt='beforeImage' width={'100%'} height={'100%'}/>
  const afterGraph = <div key='crrm-graph-after'><AutoSizer>{({ height, width }) => <BasicGraph
    style={{ width, height }}
    chartRef={connectChart}
    title={$t({ defaultMessage: 'Recommended' })}
    data={graphs[1]}
    zoomScale={zoomScale}
  />}</AutoSizer></div>
  const afterImage = <img src={summaryUrlAfter} alt='afterImage' width={'100%'} height={'100%'}/>

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
    details: EnhancedRecommendation,
    crrmData: ProcessedCloudRRMGraph[],
    summaryUrlBefore?: string,
    summaryUrlAfter?: string
  }) => {
  const { $t } = useIntl()
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const band = recommendationBandMapping[details.code as keyof typeof recommendationBandMapping]
  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom
  return <UI.Wrapper>
    <UI.ClickableWrapper onClick={showDrawer}/>
    <Card
      actions={{
        actionName: $t({ defaultMessage: 'View More' }),
        onActionClick: showDrawer
      }}
      children={<UI.GraphWrapper>{
        useGraph(
          crrmData,
          details,
          bandwidthMapping[band],
          detailsZoomScale,
          false,
          summaryUrlBefore,
          summaryUrlAfter
        )
      }</UI.GraphWrapper>} />
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

export function getGraphKPI (
  recommendation: EnhancedRecommendation,
  graphData: ProcessedCloudRRMGraph[]
) {
  // kpi for interferingLinks
  const { before, after } = recommendation?.crrmInterferingLinks!
  const deltaSign = '-'
  const format = formatter('percentFormat')
  const links = kpiDelta(before, after, deltaSign, format)

  // kpi for linksPerAP
  const kpiBefore = graphData[0]
  const kpiAfter = graphData[1]
  const beforeLinks = kpiBefore?.interferingLinks || 0
  const afterLinks = kpiAfter?.interferingLinks || 0
  const beforeAPs = kpiBefore?.affectedAPs || 0
  const afterAPs = kpiAfter?.affectedAPs || 0
  const averageBefore = beforeAPs ? beforeLinks / beforeAPs : 0
  const averageAfter = afterAPs ? afterLinks / afterAPs : 0
  const averageLinks = kpiDelta(averageBefore, averageAfter, deltaSign, format)

  return {
    interferingLinks: {
      links: links,
      after: after
    },
    linksPerAP: {
      average: averageLinks,
      after: averageAfter
    }
  }
}

export const SliderGraphBefore = (
  { crrmData, setSliderUrlBefore }:
  { crrmData: ProcessedCloudRRMGraph[], setSliderUrlBefore: (url: string) => void }) => {
  const { $t } = useIntl()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSliderUrlBefore(url)
    }
  }
  return (
    <div data-testid='crrm-slider-before'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      {crrmData[0] && <BasicGraph
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Current' })}
        data={crrmData[0]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 300
        }}
        backgroundColor='#342D2C'
        titleColor='white'
      />}
    </div>
  )
}

export const SliderGraphAfter = (
  { crrmData, setSliderUrlAfter }:
  { crrmData: ProcessedCloudRRMGraph[], setSliderUrlAfter: (url: string) => void }) => {
  const { $t } = useIntl()
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setSliderUrlAfter(url)
    }
  }
  return (
    <div data-testid='crrm-slider-after'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'end'
      }}>
      {crrmData[1] && <BasicGraph
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Forecast' })}
        data={crrmData[1]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 300
        }}
        alignRight={true}
      />}
    </div>
  )
}

export const SummaryGraphBefore = (
  { details, crrmData, setSummaryUrlBefore, detailsPage = false }:
  { details: EnhancedRecommendation,
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
      {crrmData[0] && <BasicGraph
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
