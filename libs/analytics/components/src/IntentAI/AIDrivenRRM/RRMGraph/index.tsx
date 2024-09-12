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

import { useIntentContext }  from '../../IntentContext'
import { Intent }            from '../../useIntentDetailsQuery'
import { dataRetentionText } from '../../utils'

import { Legend } from './Legend'
import * as UI    from './styledComponents'


// eslint-disable-next-line max-len
const STATIC_SUMMARY_URL='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22350%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20viewBox%3D%220%200%20350%20300%22%3E%0A%3Crect%20width%3D%22350%22%20height%3D%22300%22%20x%3D%220%22%20y%3D%220%22%20id%3D%220%22%20fill%3D%22none%22%20fill-opacity%3D%221%22%3E%3C%2Frect%3E%0A%3Cpath%20d%3D%22M209.9%20152.4L181.6%2094.5%22%20transform%3D%22matrix(0.405%2C0%2C0%2C0.405%2C104.125%2C89.25)%22%20fill%3D%22none%22%20stroke%3D%22%23ACAEB0%22%20stroke-width%3D%224.938271604938271%22%20stroke-opacity%3D%220.5%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M209.9%20152.4L239.1%20209.5%22%20transform%3D%22matrix(0.405%2C0%2C0%2C0.405%2C104.125%2C89.25)%22%20fill%3D%22none%22%20stroke%3D%22%23ACAEB0%22%20stroke-width%3D%224.938271604938271%22%20stroke-opacity%3D%220.5%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M-22.1%2056.8L-36.9%20114.8%22%20transform%3D%22matrix(0.405%2C0%2C0%2C0.405%2C104.125%2C89.25)%22%20fill%3D%22none%22%20stroke%3D%22%23ACAEB0%22%20stroke-width%3D%224.938271604938271%22%20stroke-opacity%3D%220.5%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C270.0256%2C188.998)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C187.4%2C247.6979)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C189.1212%2C150.9755)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C111.9058%2C219.6111)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C89.1963%2C135.7297)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C177.6692%2C127.5285)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C95.1573%2C112.2739)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C173.3462%2C51.3092)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C255.211%2C91.7876)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M1%200A1%201%200%201%201%201%20-0.0001%22%20transform%3D%22matrix(7.716%2C0%2C0%2C7.716%2C200.9675%2C174.0886)%22%20fill%3D%22%23ACAEB0%22%20stroke%3D%22%23FFFFFF%22%20stroke-width%3D%220.12960082944530846%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M-5%20-5l10%200l0%2010l-10%200Z%22%20transform%3D%22translate(20%2020)%22%20fill%3D%22rgb(0%2C0%2C0)%22%20fill-opacity%3D%220%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%220%22%3E%3C%2Fpath%3E%0A%3Cpath%20d%3D%22M0%200l0%200l0%200l0%200Z%22%20transform%3D%22translate(20%2020)%22%20fill%3D%22none%22%3E%3C%2Fpath%3E%0A%3C%2Fsvg%3E'

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

const GraphTitle = ({ details }: { details: Intent }) => {
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

export const IntentAIRRMGraph: React.FC<{
  crrmData: ProcessedCloudRRMGraph[],
  summaryUrlBefore?: string,
  summaryUrlAfter?: string,
}> = ({ crrmData, summaryUrlBefore, summaryUrlAfter }) => {
  const { $t } = useIntl()
  const { intent, state, isDataRetained } = useIntentContext()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom

  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const noData = state === 'no-data'

  if (!isDataRetained) return <>{$t(dataRetentionText)}</>

  return <UI.Wrapper>
    <Card>
      <UI.GraphWrapper data-testid='graph-wrapper'
        $blur={noData}
        key={'graph-details'}
      >
        <ImageGraph
          beforeSrc={noData ? STATIC_SUMMARY_URL : summaryUrlBefore}
          afterSrc={noData ? STATIC_SUMMARY_URL : summaryUrlAfter}
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
