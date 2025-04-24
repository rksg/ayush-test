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
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                              from '@acx-ui/formatter'
import { useLazyGetEdgePortTrafficQuery }                                         from '@acx-ui/rc/services'
import { EdgeAllPortTrafficData, EdgeStatus, EdgeTimeSeriesPayload, defaultSort } from '@acx-ui/rc/utils'
import type { TimeStamp }                                                         from '@acx-ui/types'
import { useDateFilter, getIntl  }                                                from '@acx-ui/utils'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

export const EdgeClusterWanPortsTrafficByVolumeWidget = (props: {
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
              {graphParameters.map((graphData) => {
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
      ? <NoData text={$t({ defaultMessage: 'No WAN port exist' })} />
      : <Loader states={[{ isLoading: wanPortIfNames.length !== 0 && data.length === 0 }]}>
        <AutoSizer>
          { isEmpty(data[0]?.timeSeries?.time)
            ? () => <NoData />
            : ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={transformTimeSeriesChartData(data)}
                dataFormatter={formatter('bytesFormat')}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </Loader>
    }
  </HistoricalCard>
}

export const transformTimeSeriesChartData =
(data: EdgeAllPortTrafficData[]): TimeSeriesChartData[] => {
  const { $t } = getIntl()

  const seriesMapping = [
    { key: 'total', name: $t({ defaultMessage: 'Total Traffic' }) },
    { key: 'rx', name: $t({ defaultMessage: 'Inbound' }) },
    { key: 'tx', name: $t({ defaultMessage: 'Outbound' }) }
  ] as Array<{ key: string; name: string }>

  // Collect all unique timestamps across all nodes
  const allTimestampsSet = new Set<TimeStamp>()
  data.forEach((dataPerNode) => {
    dataPerNode.timeSeries.time.forEach((time) => allTimestampsSet.add(time))
  })
  // eslint-disable-next-line max-len
  const allTimestamps = Array.from(allTimestampsSet).sort(defaultSort)

  return seriesMapping.map(({ key, name }) => {
    // For each timestamp, sum up the value for the key across all ports and all nodes
    const dataPoints = allTimestamps.map((timestamp) => {
      let sum = 0
      data.forEach((dataPerNode) => {
        const timeIdx = dataPerNode.timeSeries.time.indexOf(timestamp)
        if (timeIdx !== -1) {
          dataPerNode.timeSeries.ports.forEach((port) => {
            const arr = get(port, key)
            if (Array.isArray(arr) && arr[timeIdx] != null) {
              sum += arr[timeIdx]
            }
          })
        }
      })
      return [timestamp, sum] as [TimeStamp, number]
    })
    return {
      key,
      name,
      data: dataPoints
    }
  })
}