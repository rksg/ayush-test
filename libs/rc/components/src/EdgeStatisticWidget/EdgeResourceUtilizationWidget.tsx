import { useEffect, useState } from 'react'

import _                                              from 'lodash'
import { renderToString }                             from 'react-dom/server'
import { RawIntlProvider, useIntl, FormattedMessage } from 'react-intl'
import { useParams }                                  from 'react-router-dom'
import AutoSizer                                      from 'react-virtualized-auto-sizer'


import { getSeriesData, calculateGranularity, TimeSeriesChartData } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData,
  tooltipOptions,
  TooltipFormatterParams,
  TooltipWrapper,
  Badge,
  defaultRichTextFormatValues
} from '@acx-ui/components'
import { formatter, DateFormatEnum }                     from '@acx-ui/formatter'
import { useGetEdgeResourceUtilizationMutation }         from '@acx-ui/rc/services'
import { EdgeResourceTimeSeries, EdgeTimeSeriesPayload } from '@acx-ui/rc/utils'
import type { TimeStamp }                                from '@acx-ui/types'
import { useDateFilter, getIntl }                        from '@acx-ui/utils'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

interface UtilizationSeriesFragment {
  key: string,
  fragment: {
    percentage: number,
    unit: number | undefined,
    time: TimeStamp
  }[]
}

type Key = keyof Omit<EdgeResourceTimeSeries, 'time'>

export function EdgeResourceUtilizationWidget () {
  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  const [loadingState, setLoadingState] = useState<boolean>(true)
  const [queryResults, setQueryResults] = useState<TimeSeriesChartData[]>([])
  const [seriesFragment, setSeriesFragment] = useState<UtilizationSeriesFragment[]>([])


  const [trigger, { isLoading }] = useGetEdgeResourceUtilizationMutation()

  const seriesMapping = [
    { key: 'cpu', name: $t({ defaultMessage: 'CPU' }) },
    { key: 'memory', name: $t({ defaultMessage: 'Memory' }) },
    { key: 'disk', name: $t({ defaultMessage: 'Disk' }) }
  ] as Array<{ key: Key, name: string }>

  useEffect(() => {
    const initialWidget = async () => {
      await trigger({
        params: { serialNumber: params.serialNumber },
        payload: {
          start: filters?.startDate,
          end: filters?.endDate,
          granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
        } as EdgeTimeSeriesPayload
      }).unwrap()
        .then((data) => {
          setQueryResults(getSeriesData(data.timeSeries, seriesMapping))

          const { cpu, memory, disk, time, memoryUsedBytes, diskUsedBytes } = data.timeSeries
          setSeriesFragment([
            {
              key: 'CPU',
              fragment: _.zipWith(cpu, time, (percentage, time) => {
                return {
                  percentage,
                  unit: undefined,
                  time
                }
              })
            },
            {
              key: 'Memory',
              fragment: _.zipWith(memory, memoryUsedBytes, time, (percentage, unit, time) => {
                return {
                  percentage,
                  unit,
                  time
                }
              })
            },
            {
              key: 'Disk',
              fragment: _.zipWith(disk, diskUsedBytes, time, (percentage, unit, time) => {
                return {
                  percentage,
                  unit,
                  time
                }
              })
            }
          ])
          setLoadingState(isLoading)
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
    }
    initialWidget()
  }, [filters])

  const defaultOption: EChartsOption = {
    tooltip: {
      ...tooltipOptions(),
      trigger: 'axis',
      // eslint-disable-next-line max-len
      formatter: (parameters: TooltipFormatterParams | TooltipFormatterParams[]) : string | HTMLElement | HTMLElement[] => {
        const intl = getIntl()
        const graphParameters = Array.isArray(parameters) ? parameters : [parameters]
        const [ time ] = graphParameters[0].data as [TimeStamp, number]
        const graphDataIndex = graphParameters[0].dataIndex as number

        return renderToString(
          <RawIntlProvider value={intl}>
            <TooltipWrapper maxWidth={300}>
              <time dateTime={new Date(time).toJSON()}>
                {formatter(DateFormatEnum.DateTimeFormat)(time) as string}
              </time>
              <ul>
                {(_.isEmpty(queryResults)|| _.isEmpty(queryResults[0].data)) ? null :
                  seriesFragment.map((resource) => {
                  // eslint-disable-next-line max-len
                    const color = graphParameters.find(p => p.seriesName === resource.key)?.color || ''
                    const fragment = resource.fragment[graphDataIndex]
                    return (
                      <li key={resource.key}>
                        <Badge
                          className='acx-chart-tooltip'
                          color={(color) as string}
                          text={<FormattedMessage
                            defaultMessage='{name}: <b>{value}</b>'
                            description='Label before colon, value after colon'
                            values={{
                              ...defaultRichTextFormatValues,
                              name: resource.key,
                              value: fragment.unit ?
                              // eslint-disable-next-line max-len
                                `${formatter('percent')(fragment.percentage)} (${formatter('bytesFormat')(fragment.unit)})` :
                                `${formatter('percent')(fragment.percentage)}`
                            }}
                          />}
                        />
                      </li>
                    )
                  })
                }
              </ul>
            </TooltipWrapper>
          </RawIntlProvider>
        )
      }
    } as TooltipComponentOption
  }

  return (
    <Loader states={[{ isLoading: loadingState }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Resource Utilization' })}>
        <AutoSizer>
          {(_.isEmpty(queryResults)|| _.isEmpty(queryResults[0].data)) ?
            () =><NoData />:
            ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}