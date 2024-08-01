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

import { EnhancedIntent } from '../IntentAIForm/services'

import { Legend }               from './Legend'
import { useIntentAICRRMQuery } from './services'
import * as UI                  from './styledComponents'

function useGraph (
  graphs: ProcessedCloudRRMGraph[],
  intent: EnhancedIntent,
  legend: string[],
  zoomScale: ScalePower<number, number, never>,
  isDrawer: boolean
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
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(intent.dataEndTime)
        })}
        data={graphs[0]}
        zoomScale={zoomScale}
        grayBackground={isDrawer}
      />}</AutoSizer></div>,
      ...(!isDrawer ? [<div key='crrm-arrow' style={{ display: 'flex', alignItems: 'center' }}>
        <UI.RightArrow/>
      </div>] : []),
      <div key='crrm-graph-after'><AutoSizer>{({ height, width }) => <BasicGraph
        style={{ width, height }}
        chartRef={connectChart}
        title={$t({ defaultMessage: 'Recommended' })}
        data={graphs[1]}
        zoomScale={zoomScale}
        grayBackground={isDrawer}/>}</AutoSizer></div>,
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

export const IntentAIRRMGraph = ({ details }: { details: EnhancedIntent }) => {
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
    <Loader states={[queryResult]}>
      <Card>
        <UI.GraphWrapper children={
          useGraph(queryResult.data, details, bandwidthMapping[band], detailsZoomScale, false)
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
              queryResult.data,
              details,
              bandwidthMapping[band],
              drawerZoomScale,
              true
            )}
          </UI.DrawerGraphWrapper>
        }/>
    </Loader>
  </UI.Wrapper>
}
