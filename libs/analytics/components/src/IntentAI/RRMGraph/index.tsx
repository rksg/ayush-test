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
  Loader,
  Graph as BasicGraph,
  ProcessedCloudRRMGraph,
  recommendationBandMapping,
  bandwidthMapping
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { EnhancedRecommendation } from '../IntentAIForm/services'

import { Legend }               from './Legend'
import { useIntentAICRRMQuery } from './services'
import * as UI                  from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  recommendation: EnhancedRecommendation,
  legend: string[],
  zoomScale: ScalePower<number, number, never>,
  isDrawer: boolean
  // setUrlBefore?: (url: string) => void,
  // setUrlAfter?: (url: string) => void
) {
  const { $t } = useIntl()
  const [ urlBefore, setUrlBefore ] = useState('')
  const [ urlAfter, setUrlAfter ] = useState('')
  const connectChart = (chart: ReactECharts | null, title: string) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      if (title === 'before' && setUrlBefore) {
        setUrlBefore(url)
      } else if (title === 'recommended' && setUrlAfter) {
        setUrlAfter(url)
      }
      // if (chart.props.title === 'Before') {
      //   urlBefore = url
      // } else {
      //   urlAfter = url
      // }
      console.log('1111111chart', chart)
      console.log('1111111url', url)
    }
  }
  useEffect(() => { connect('graphGroup') }, [])

  console.log('urlBefore', urlBefore)
  console.log('urlAfter', urlAfter)

  const beforeGraph = <div key='crrm-graph-before'><AutoSizer>{({ height, width }) => <BasicGraph
    style={{ width, height }}
    chartRef={chart => connectChart(chart, 'before')}
    title={$t({ defaultMessage: 'Before' })}
    subtext={$t({ defaultMessage: 'As at {dateTime}' }, {
      dateTime: formatter(DateFormatEnum.DateTimeFormat)(recommendation.dataEndTime)
    })}
    data={graphs[0]}
    zoomScale={zoomScale}
    grayBackground={isDrawer}
  />}</AutoSizer></div>
  const beforeImage = <img src={urlBefore} alt='beforeImage' />
  const afterGraph = <div key='crrm-graph-after'><AutoSizer>{({ height, width }) => <BasicGraph
    style={{ width, height }}
    chartRef={chart => connectChart(chart, 'recommended')}
    title={$t({ defaultMessage: 'Recommended' })}
    data={graphs[1]}
    zoomScale={zoomScale}
    grayBackground={isDrawer}/>}</AutoSizer></div>
  const afterImage = <img src={urlAfter} alt='afterImage' />

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
  details } : {
    details: EnhancedRecommendation,
    // setUrlBefore?: (url: string) => void,
    // setUrlAfter?: (url: string) => void
  }) => {
  const { $t } = useIntl()
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const band = recommendationBandMapping[details.code as keyof typeof recommendationBandMapping]
  const queryResult = useIntentAICRRMQuery(details, band)
  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom
  return <UI.Wrapper>
    <UI.ClickableWrapper onClick={showDrawer}/>
    <Loader states={[queryResult]}>
      <Card
        actions={{
          actionName: $t({ defaultMessage: 'View More' }),
          onActionClick: showDrawer
        }}
        children={<UI.GraphWrapper>{
          useGraph(
            queryResult.data,
            details,
            bandwidthMapping[band],
            detailsZoomScale,
            false
            // setUrlBefore,
            // setUrlAfter
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
              queryResult.data,
              details,
              bandwidthMapping[band],
              drawerZoomScale,
              true
              // setUrlBefore,
              // setUrlAfter
            )}
          </UI.DrawerGraphWrapper>
        }/>
    </Loader>
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
