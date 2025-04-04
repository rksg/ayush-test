import React, { useEffect, useState } from 'react'

import { Space }                                    from 'antd'
import { ScalePower }                               from 'd3'
import { scalePow }                                 from 'd3-scale'
import { EChartsType }                              from 'echarts'
import ReactECharts                                 from 'echarts-for-react'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'
import AutoSizer                                    from 'react-virtualized-auto-sizer'

import {
  Card,
  Drawer,
  DrawerTypes,
  Graph as BasicGraph,
  ProcessedCloudRRMGraph,
  Loader,
  Tooltip,
  categoryStyles
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { InformationOutlined }       from '@acx-ui/icons'

import { richTextFormatValues }      from '../../common/richTextFormatValues'
import { useIntentContext }          from '../../IntentContext'
import { IntentDetail, intentState } from '../../useIntentDetailsQuery'
import {
  coldTierDataText,
  dataRetentionText,
  isVisibleByAction,
  Actions
} from '../../utils'

import { Legend }               from './Legend'
import { useIntentAICRRMQuery } from './services'
import * as UI                  from './styledComponents'

const ImageGraph = ({ beforeSrc, afterSrc }: { beforeSrc?: string, afterSrc?: string }) => <>
  {beforeSrc && <img
    src={beforeSrc}
    alt='rrm-graph-before'
    style={{
      margin: 'auto',
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%'
    }}
  />}
  <UI.CrrmArrow children={<UI.RightArrow/>} />
  {afterSrc && <img
    src={afterSrc}
    alt='rrm-graph-after'
    style={{
      margin: 'auto',
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%'
    }}
  />}
</>

export function DataGraph (props: {
  graphs: ProcessedCloudRRMGraph[],
  zoomScale: ScalePower<number, number, never>
}) {
  const graphGroupRef = React.useRef<EChartsType[]>([])
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      if (!graphGroupRef.current.includes(instance)) {
        graphGroupRef.current.push(instance)
      }
    }
  }

  const onEvents = {
    mouseover: (params: { seriesIndex: string, name: string }) => {
      graphGroupRef.current.forEach((graph) => {
        graph.dispatchAction({
          type: 'showTip',
          seriesIndex: params.seriesIndex,
          name: params.name
        })
      })
    },
    mouseout: () => {
      graphGroupRef.current.forEach((graph) => {
        graph.dispatchAction({ type: 'hideTip' })
      })
    }
  }

  if (!props.graphs?.length) return null

  return <>
    <div><AutoSizer>{({ height, width }) => <BasicGraph
      style={{ width, height }}
      chartRef={connectChart}
      onEvents={onEvents}
      title=''
      data={props.graphs[0]}
      zoomScale={props.zoomScale}
      backgroundColor='transparent'
    />}</AutoSizer></div>
    <UI.CrrmArrow children={<UI.RightArrow/>} />
    <div><AutoSizer>{({ height, width }) => <BasicGraph
      style={{ width, height }}
      chartRef={connectChart}
      onEvents={onEvents}
      title=''
      data={props.graphs[1]}
      zoomScale={props.zoomScale}
      backgroundColor='transparent'
    />}</AutoSizer></div>
  </>
}

export const detailsZoomScale = scalePow()
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

const rrmGraphTooltip = (intent: IntentDetail) => {
  if (!isVisibleByAction([intent], Actions.Optimize)) {
    return null
  }

  const text = intentState(intent) === 'inactive'
    ? defineMessage({ defaultMessage: `
      The graph and channel plan are generated based on the <i>default</i> Intent priority.
      `
    })
    : defineMessage({ defaultMessage: `
      The graph and channel plan are generated based on the <i>previously saved</i> Intent priority.
      `
    })
  return {
    title: defineMessage({ defaultMessage: `
      If the Intent priority is changed and applied, the RRM Machine Learning algorithm
      will re-learn using the updated Intent priority and recent dynamic metrics during
      the next scheduled daily execution, rebuilding the graph and channel plan accordingly.
      `
    }),
    text
  }
}

export const IntentAIRRMGraph = ({
  width = 250,
  isFullOptimization
} : {
    width?: number,
    isFullOptimization?: boolean
  }) => {
  const { $t } = useIntl()
  const { intent, state, isDataRetained, isHotTierData } = useIntentContext()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)
  const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
  const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom

  const tooltip = rrmGraphTooltip(intent)
  const channelPlan = _.get(intent, ['metadata', 'algorithmData', 'isCrrmFullOptimization'])
  const showTooltip = tooltip && (channelPlan !== isFullOptimization)

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const noData = state === 'no-data'

  if (!isHotTierData) return <Card>{$t(coldTierDataText)}</Card>
  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>

  if (noData) {
    return <Card>
      {$t({ defaultMessage: 'Graph modeling will be generated once Intent is activated.' })}
    </Card>
  }

  return <UI.Wrapper>
    {crrmData && <div hidden data-testid='hidden-graph'>
      <SummaryGraphBefore
        width={width}
        crrmData={crrmData}
        setUrl={setSummaryUrlBefore}
      />
      <SummaryGraphAfter
        width={width}
        crrmData={crrmData}
        setUrl={setSummaryUrlAfter}
      />
    </div>}
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
          <UI.GraphLegendWrapper><Legend {...categoryStyles}/></UI.GraphLegendWrapper>
        </UI.GraphWrapper>
        <UI.GraphFooterWrapper>
          {showTooltip ? (<Space align='start'>
            <Tooltip
              title={$t(tooltip.title)}
              placement='top'
            >
              <InformationOutlined />
            </Tooltip>
            <FormattedMessage {...tooltip.text} values={richTextFormatValues} />
          </Space>) : <div />}
          <UI.ViewMoreButton
            hidden={noData}
            onClick={showDrawer}
            children={$t({ defaultMessage: 'View More' })}
          />
        </UI.GraphFooterWrapper>
      </Card>
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
            <UI.GraphLegendWrapper><Legend {...categoryStyles}/></UI.GraphLegendWrapper>
          </UI.GraphWrapper>
        }
      />
    </Loader>
  </UI.Wrapper>
}

export const GraphImage = (
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

export const SummaryGraphBefore = (
  { crrmData, setUrl, width }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void, width: number }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={0}
    setUrl={setUrl}
    justifyContent='start'
    backgroundColor='transparent'
    width={width}
  />
}
export const SummaryGraphAfter = (
  { crrmData, setUrl, width }:
  { crrmData: ProcessedCloudRRMGraph[], setUrl: (url: string) => void, width: number }
) => {
  return <GraphImage
    crrmData={crrmData}
    data={1}
    setUrl={setUrl}
    justifyContent='end'
    backgroundColor='transparent'
    width={width}
  />
}
