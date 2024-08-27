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
  ProcessedCloudRRMGraph
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { Intent } from '../../useIntentDetailsQuery'

import { Legend } from './Legend'
import * as UI    from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  zoomScale: ScalePower<number, number, never>,
  isDrawer: boolean,
  summaryUrlBefore?: string,
  summaryUrlAfter?: string
) {
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
    title=''
    data={graphs[0]}
    zoomScale={zoomScale}
    backgroundColor='transparent'
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
    title=''
    data={graphs[1]}
    zoomScale={zoomScale}
    backgroundColor='transparent'
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
      <UI.CrrmArrow key='crrm-graph-arrow'>
        <UI.RightArrow/>
      </UI.CrrmArrow>,
      isDrawer ? afterGraph : afterImage,
      <Legend key='crrm-graph-legend' />
    ]
    : []
}

const detailsZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500])
  .range([0.8, 0.45, 0.3, 0.25, 0.135, 0.1, 0.075, 0.06, 0.05])
const drawerZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.07])

const GraphTitle = ({ details }: { details: Intent }) => {
  const { $t } = useIntl()
  return <UI.GraphTitleWrapper>
    <div>
      <UI.GraphTitle>{$t({ defaultMessage: 'Before' })}</UI.GraphTitle>
      <UI.GraphSubTitle>
        {$t({ defaultMessage: 'As at {dateTime}' }, {
          // TODO: take dataEndTime from intent.metadata.dataEndTime
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(details.dataEndTime)
        })}
      </UI.GraphSubTitle>
    </div>
    <UI.GraphTitle>{$t({ defaultMessage: 'Recommended' })}</UI.GraphTitle>
  </UI.GraphTitleWrapper>
}

export const IntentAIRRMGraph = ({
  details, crrmData, summaryUrlBefore, summaryUrlAfter } : {
    details: Intent,
    crrmData: ProcessedCloudRRMGraph[],
    summaryUrlBefore?: string,
    summaryUrlAfter?: string
  }) => {
  const { $t } = useIntl()
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom
  return <UI.Wrapper>
    <Card>
      <UI.GraphWrapper key={'graph-details'}>
        {useGraph(crrmData, detailsZoomScale, false,
          summaryUrlBefore, summaryUrlAfter)}
        <GraphTitle details={details} />
      </UI.GraphWrapper>
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
        <UI.GraphWrapper>
          {useGraph(crrmData, drawerZoomScale, true)}
          <GraphTitle details={details} />
        </UI.GraphWrapper>
      }
    />
  </UI.Wrapper>
}

const GraphImage = (
  { crrmData, data, setUrl, justifyContent, backgroundColor, width } :
  {
    crrmData: ProcessedCloudRRMGraph[],
    data: number,
    setUrl: (url: string) => void,
    justifyContent: string,
    backgroundColor?: string,
    width: number
  }
) => {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setUrl(url)
    }
  }
  return (
    <div key='graph-image'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: justifyContent
      }}>
      {crrmData[data] && <BasicGraph
        chartRef={connectChart}
        title=''
        data={crrmData[data]}
        zoomScale={detailsZoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: width
        }}
        backgroundColor={backgroundColor}
      />}
    </div>
  )
}

export const SliderGraphBefore = (
  { crrmData, setUrl }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={0}
    setUrl={setUrl}
    justifyContent='start'
    backgroundColor='#333333'
    width={300}
  />
}

export const SliderGraphAfter = (
  { crrmData, setUrl }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={1}
    setUrl={setUrl}
    justifyContent='end'
    width={300}
  />
}
export const SummaryGraphBefore = (
  { crrmData, setUrl, detailsPage }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void, detailsPage?: boolean }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={0}
    setUrl={setUrl}
    justifyContent='start'
    backgroundColor='transparent'
    width={detailsPage ? 350 : 250}
  />
}
export const SummaryGraphAfter = (
  { crrmData, setUrl, detailsPage }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void, detailsPage?: boolean }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={1}
    setUrl={setUrl}
    justifyContent='end'
    backgroundColor='transparent'
    width={detailsPage ? 350 : 250}
  />
}
