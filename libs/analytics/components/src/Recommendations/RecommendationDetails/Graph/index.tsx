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
  Loader,
  Graph as BasicGraph,
  ProcessedCloudRRMGraph,
  recommendationBandMapping,
  bandwidthMapping
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { EnhancedRecommendation } from '../services'

import { DownloadRRMComparison }                                       from './DownloadRRMComparison'
import { Legend }                                                      from './Legend'
import { useCRRMQuery }                                                from './services'
import { Wrapper, GraphWrapper, DrawerGraphWrapper, ClickableWrapper } from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  recommendation: EnhancedRecommendation,
  legend: string[],
  zoomScale: ScalePower<number, number, never>
) {
  const { $t } = useIntl()

  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
    }
  }
  useEffect(() => { connect('graphGroup') }, [])

  return (graphs?.length)
    ? [
      <div key='crrm-graph-before'><AutoSizer>{({ height, width }) => <BasicGraph
        style={{ width, height }}
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Before' })}
        subtext={$t({ defaultMessage: 'As at {dateTime}' }, {
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(recommendation.dataEndTime)
        })}
        data={graphs[0]}
        zoomScale={zoomScale}
      />}</AutoSizer></div>,
      <div key='crrm-graph-after'><AutoSizer>{({ height, width }) => <BasicGraph
        style={{ width, height }}
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Recommended' })}
        data={graphs[1]}
        zoomScale={zoomScale}/>}</AutoSizer></div>,
      ...(legend?.length ? [<Legend key='crrm-graph-legend' bandwidths={legend}/>] : [])
    ]
    : null
}

const detailsZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500, 750])
  .range([1.75, 0.6, 0.4, 0.35, 0.2, 0.15, 0.11, 0.09, 0.02, 0.01])
const drawerZoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.04])

export const CloudRRMGraph = ({ details }: { details: EnhancedRecommendation }) => {
  const { $t } = useIntl()
  const title = $t({ defaultMessage: 'Key Performance Indications' })
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)
  const band = recommendationBandMapping[details.code as keyof typeof recommendationBandMapping]
  const queryResult = useCRRMQuery(details, band)
  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible]) // to reset graph zoom
  return <Wrapper>
    <ClickableWrapper onClick={showDrawer}/>
    <Loader states={[queryResult]}>
      <Card
        type='no-border'
        title={title}
        action={{
          actionName: $t({ defaultMessage: 'More details' }),
          onActionClick: showDrawer
        }}
        children={<GraphWrapper>{
          useGraph(queryResult.data, details, [], detailsZoomScale)
        }</GraphWrapper>} />
      <Drawer
        key={key}
        drawerType={DrawerTypes.FullHeight}
        width={'90vw'}
        title={title}
        visible={visible}
        onClose={closeDrawer}
        children={
          <DrawerGraphWrapper>
            {useGraph(
              queryResult.data,
              details,
              bandwidthMapping[band],
              drawerZoomScale
            )}
            <DownloadRRMComparison details={details}/>
          </DrawerGraphWrapper>
        }/>
    </Loader>
  </Wrapper>
}
