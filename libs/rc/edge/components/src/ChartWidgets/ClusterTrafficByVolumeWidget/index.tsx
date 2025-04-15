import { useEffect, useState } from 'react'

import { find, get, isEmpty }                         from 'lodash'
import { renderToString }                             from 'react-dom/server'
import { FormattedMessage, RawIntlProvider, useIntl } from 'react-intl'
import AutoSizer                                      from 'react-virtualized-auto-sizer'

import { calculateGranularity, TimeSeriesChartData } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData,
  tooltipOptions,
  getDefaultEarliestStart,
  TooltipFormatterParams,
  TooltipWrapper,
  defaultRichTextFormatValues,
  Badge
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                 from '@acx-ui/formatter'
import { useLazyGetEdgePortTrafficQuery }                            from '@acx-ui/rc/services'
import { EdgeAllPortTrafficData, EdgeStatus, EdgeTimeSeriesPayload } from '@acx-ui/rc/utils'
import type { TimeStamp }                                            from '@acx-ui/types'
import { useDateFilter, getIntl  }                                   from '@acx-ui/utils'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

const transformTimeSeriesChartData = (data: EdgeAllPortTrafficData): TimeSeriesChartData[] => {
  const { $t } = getIntl()

  const seriesMapping = [
    { key: 'total', name: $t({ defaultMessage: 'Total Traffic' }) },
    { key: 'rx', name: $t({ defaultMessage: 'Inbound' }) },
    { key: 'tx', name: $t({ defaultMessage: 'Outbound' }) }
  ] as Array<{ key: string; name: string }>

  return seriesMapping.map(({ key, name }) => {
    return {
      key,
      name,
      data: data.timeSeries.time.map((time, index) => {
        // eslint-disable-next-line max-len
        const sum = data.timeSeries.ports.reduce((sum, port) => sum + (get(port, key)[index] || 0), 0)
        return [time, sum]
      }) as [TimeStamp, number | null][]
    }
  })
}

export const EdgeClusterTrafficByVolumeWidget = (props: {
  edges: EdgeStatus[] | undefined,
  wanPortIfNames: { edgeId: string, ifName: string }[],
 }) => {
  const { $t } = useIntl()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { edges, wanPortIfNames } = props

  const filters = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })

  const [data, setData] = useState<EdgeAllPortTrafficData[]>([])
  const [ getEdgePortTraffic ]= useLazyGetEdgePortTrafficQuery()

  useEffect(() => {
    if (!edges?.length || isEmpty(wanPortIfNames)) return

    const fetchData = async () => {
      const requests = edges.map((edge) => {
        return getEdgePortTraffic({
          params: { serialNumber: edge.serialNumber },
          payload: {
            start: filters?.startDate,
            end: filters?.endDate,
            granularity: calculateGranularity(filters?.startDate, filters?.endDate)
          } as EdgeTimeSeriesPayload
        }).unwrap()
      })

      const reqResults = await Promise.allSettled(requests)
      const results= reqResults
        .map((result, index) => ({ result, serialNumber: edges[index].serialNumber }))
        // eslint-disable-next-line max-len
        .filter((p): p is { result: PromiseFulfilledResult<EdgeAllPortTrafficData>, serialNumber: string } => p.result.status === 'fulfilled')

      const mergedResults = results.map(({ result, serialNumber }) => {
        const data = result.value as EdgeAllPortTrafficData

        const newPortsData = data.timeSeries.ports.filter((port) => {
          return find(wanPortIfNames, { edgeId: serialNumber, ifName: port.portName })
        })

        return {
          ...data,
          timeSeries: {
            ...data.timeSeries,
            ports: newPortsData
          },
          portCount: newPortsData.length
        }
      })

      setData(mergedResults as EdgeAllPortTrafficData[])
    }

    fetchData()
  }, [edges, wanPortIfNames])

  const defaultOption: EChartsOption = {
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      // eslint-disable-next-line max-len
      formatter: (parameters: TooltipFormatterParams | TooltipFormatterParams[]) : string | HTMLElement | HTMLElement[] => {
        const intl = getIntl()
        const graphParameters = Array.isArray(parameters) ? parameters : [parameters]
        const [ time ] = graphParameters[0].data as [TimeStamp, number]

        return renderToString(<RawIntlProvider value={intl}>
          <TooltipWrapper maxWidth={300}>
            <time dateTime={new Date(time).toJSON()}>
              {formatter(DateFormatEnum.DateTimeFormat)(time) as string}
            </time>
            <ul>
              {!isEmpty(data[0].timeSeries.time) &&
              graphParameters.map((graphData) => {

                return <li key={graphData.seriesName}>
                  <Badge
                    className='acx-chart-tooltip'
                    color={(graphData.color) as string}
                    text={<FormattedMessage
                      defaultMessage='{name}: <b>{value}</b>'
                      description='Label before colon, value after colon'
                      values={{
                        ...defaultRichTextFormatValues,
                        name: graphData.seriesName,
                        // eslint-disable-next-line max-len
                        value: `${formatter('bytesFormat')((graphData.data as [TimeStamp, number])[1])}`
                      }}
                    />}
                  />
                </li>})}
            </ul>
          </TooltipWrapper>
        </RawIntlProvider>)
      }
    } as TooltipComponentOption
  }

  return <HistoricalCard title={$t({ defaultMessage: 'WAN Traffic by Volume' })}>
    { wanPortIfNames.length === 0
      ? <NoData />
      : <Loader states={[{ isLoading: wanPortIfNames.length !== 0 && data.length === 0 }]}>
        <AutoSizer>
          { isEmpty(data[0]?.timeSeries?.time)
            ? () => <NoData />
            : ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={transformTimeSeriesChartData(data[0])}
                dataFormatter={formatter('bytesFormat')}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </Loader>
    }
  </HistoricalCard>
}