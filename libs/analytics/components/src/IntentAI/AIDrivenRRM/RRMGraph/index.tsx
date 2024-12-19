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
  Loader
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { useIntentContext }  from '../../IntentContext'
import { IntentDetail }      from '../../useIntentDetailsQuery'
import { dataRetentionText } from '../../utils'

import { Legend }               from './Legend'
import { useIntentAICRRMQuery } from './services'
import * as UI                  from './styledComponents'

const ImageGraph = ({ beforeSrc, afterSrc }: { beforeSrc?: string, afterSrc?: string }) => <>
  {beforeSrc && <img src={beforeSrc} alt='rrm-graph-before' width='100%' height='100%' />}
  <UI.CrrmArrow children={<UI.RightArrow/>} />
  {afterSrc && <img src={afterSrc} alt='rrm-graph-after' width='100%' height='100%' />}
  <Legend />
</>

function DataGraph (props: {
  graphs: ProcessedCloudRRMGraph[],
  zoomScale: ScalePower<number, number, never>
}) {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
    }
  }
  useEffect(() => { connect('graphGroup') }, [])

  if (!props.graphs?.length) return null

  return <>
    <div><AutoSizer>{({ height, width }) => <BasicGraph
      style={{ width, height }}
      chartRef={connectChart}
      title=''
      data={props.graphs[0]}
      zoomScale={props.zoomScale}
      backgroundColor='transparent'
    />}</AutoSizer></div>
    <UI.CrrmArrow children={<UI.RightArrow/>} />
    <div><AutoSizer>{({ height, width }) => <BasicGraph
      style={{ width, height }}
      chartRef={connectChart}
      title=''
      data={props.graphs[1]}
      zoomScale={props.zoomScale}
      backgroundColor='transparent'
    />}</AutoSizer></div>
    <Legend />
  </>
}

const detailsZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500])
  .range([0.8, 0.45, 0.3, 0.25, 0.135, 0.1, 0.075, 0.06, 0.05])
const drawerZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.07])

const GraphTitle = ({ details }: { details: IntentDetail }) => {
  const { $t } = useIntl()
  return <UI.GraphTitleWrapper>
    <div>
      <UI.GraphTitle>{$t({ defaultMessage: 'Before' })}</UI.GraphTitle>
      <UI.GraphSubTitle>
        {$t({ defaultMessage: 'As at {dateTime}' }, {
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(details.metadata.dataEndTime)
        })}
      </UI.GraphSubTitle>
    </div>
    <UI.GraphTitle>{$t({ defaultMessage: 'Recommended' })}</UI.GraphTitle>
  </UI.GraphTitleWrapper>
}

export const IntentAIRRMGraph = () => {
  const { $t } = useIntl()
  const { intent, state, isDataRetained } = useIntentContext()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom

  const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
  const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const noData = state === 'no-data'

  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>
  if (noData) {
    return <Card>
      {$t({ defaultMessage: 'Graph modeling will be generated once Intent is activated.' })}
    </Card>
  }

  return <UI.Wrapper>
    <div hidden>
      <SummaryGraphBefore detailsPage crrmData={crrmData} setUrl={setSummaryUrlBefore} />
      <SummaryGraphAfter detailsPage crrmData={crrmData} setUrl={setSummaryUrlAfter} />
    </div>
    <Loader states={[queryResult]}>
      <Card>
        <UI.GraphWrapper data-testid='graph-wrapper'
          key={'graph-details'}
        >
          <ImageGraph
            beforeSrc={summaryUrlBefore}
            afterSrc={summaryUrlAfter}
          />
          <GraphTitle details={intent} />
        </UI.GraphWrapper>
      </Card>
      <UI.ViewMoreButton
        hidden={noData}
        onClick={showDrawer}
        children={$t({ defaultMessage: 'View More' })}
      />
      <Drawer
        key={key}
        drawerType={DrawerTypes.FullHeight}
        width={'90vw'}
        title={title}
        visible={visible}
        onClose={closeDrawer}
        children={
          <UI.GraphWrapper>
            <DataGraph {...{ graphs: crrmData, zoomScale: drawerZoomScale }} />
            <GraphTitle details={intent} />
          </UI.GraphWrapper>
        }
      />
    </Loader>
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
