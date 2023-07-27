import { useCallback } from 'react'

import {
  CallbackDataParams
} from 'echarts/types/dist/shared'
import { flatten, uniq,max } from 'lodash'
import moment                from 'moment-timezone'
import { renderToString }    from 'react-dom/server'
import { useIntl }           from 'react-intl'
import AutoSizer             from 'react-virtualized-auto-sizer'

import { Loader, Heatmap, Card, cssStr, TooltipWrapper, NoData } from '@acx-ui/components'

import { useHeatmapDistributionByChannelQuery, ChannelDistributionHeatMapProps } from './services'

export type HeatmapApDistDataPoint = {
    timestamp : string,
    channel: string,
    apCount: string
}
export type HeatmapRogueAPDataPoint = {
    timestamp : string,
    rogueChannel: string,
    rogueApCount: string
}

export type HeatmapDFSDataPoint = {
    timestamp : string,
    channel: string,
    eventCount: string
}
export type HeatmapDataPoint =
  | HeatmapApDistDataPoint
  | HeatmapRogueAPDataPoint
  | HeatmapDFSDataPoint
export type HeatmapData = Array<Array<HeatmapDataPoint>>
export type HeatmapResponse = Record<
  'apDistribution' | 'rogueDistribution' | 'dfsEvents',
  Record<'heatmap' | 'time', HeatmapData | string[]>
>
export type ChannelType = 'apDistribution' | 'rogueDistribution' | 'dfsEvents'
const heatmapColorPalette = [
  cssStr('--acx-semantics-green-50'),
  cssStr('--acx-semantics-yellow-50'),
  cssStr('--acx-semantics-red-50')
]
export const ChannelDistributionHeatMap: React.FC<ChannelDistributionHeatMapProps> = (props) => {
  const { $t } = useIntl()

  const queryResults = useHeatmapDistributionByChannelQuery(props)
  const { heatMapConfig } = props
  const { key, value: title, channel, count, countText } = heatMapConfig

  const heatmapData = queryResults?.data?.[key as ChannelType]

  const tooltipFormatter = useCallback(
    (params: CallbackDataParams): string => {
      const xValue = Array.isArray(params.data) ? params.data?.[0] : '-'
      const yValue = Array.isArray(params.data) ? params.data?.[1] : '-'
      const count = Array.isArray(params.data) ? params.data?.[2] : '-'
      return renderToString(
        <TooltipWrapper>
          <div>
            {`${$t({ defaultMessage: 'Time' })}: ${xValue}` as string} <br />
            {`${$t({ defaultMessage: 'Channel' })}: ${yValue}` as string} <br />
            {(`${countText} : ` + count) as string}
          </div>
        </TooltipWrapper>
      )
    },
    [countText, $t]
  )
  const xAxisCategories = (heatmapData?.time as string[])?.map((datum: string) =>
    moment(datum).format('DD MMM HH:mm')
  )
  const yAxisCategories = uniq(
    flatten(heatmapData?.heatmap as HeatmapData)?.map(
      (row) => (row as HeatmapDataPoint)?.[channel as keyof HeatmapDataPoint]
    )
  )
    .filter((channel) => channel !== '0')
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
  const backfilledHeatmapData = flatten(
    (heatmapData?.heatmap as HeatmapData)?.map((heatmapDataPoint: HeatmapDataPoint[]) => {
      const time = moment(heatmapDataPoint?.[0]['timestamp']).format('DD MMM HH:mm')
      return yAxisCategories?.map((kind) => {
        const foundValue = heatmapDataPoint?.find(
          (element: HeatmapDataPoint) => element[channel as keyof HeatmapDataPoint] === kind
        ) || {
          [count]: 0
        }
        return [time, kind, foundValue[count as keyof HeatmapDataPoint]]
      })
    })
  )
  return (
    <Card title={title} type='no-border'>
      <div
        style={{
          width: 'auto',
          height: yAxisCategories.length * 20 > 400 ? yAxisCategories.length * 20 : 400
        }}>
        <Loader states={[queryResults]}>

          <AutoSizer>
            {({ height, width }) => (
              backfilledHeatmapData.length > 0 ? <Heatmap
                style={{ width, height }}
                tooltipFormatter={tooltipFormatter}
                xAxisCategories={xAxisCategories ?? []}
                yAxisCategories={yAxisCategories ?? []}
                data={backfilledHeatmapData}
                colors={heatmapColorPalette}
                min={0}
                max={max(backfilledHeatmapData?.map((row) => row?.[2])) as number}
                title={title}
              />
                : <NoData />

            )}
          </AutoSizer>
        </Loader>

      </div>
    </Card>

  )
}
