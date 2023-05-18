import _                                              from 'lodash'
import { renderToString }                             from 'react-dom/server'
import { RawIntlProvider, useIntl, FormattedMessage } from 'react-intl'
import { useParams }                                  from 'react-router-dom'
import AutoSizer                                      from 'react-virtualized-auto-sizer'

import { calculateGranularity, TimeSeriesChartData } from '@acx-ui/analytics/utils'
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
import { useGetEdgePortTrafficQuery }                    from '@acx-ui/rc/services'
import { EdgeAllPortTrafficData, EdgeTimeSeriesPayload } from '@acx-ui/rc/utils'
import type { TimeStamp }                                from '@acx-ui/types'
import { useDateFilter, getIntl  }                       from '@acx-ui/utils'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

interface TrafficSeriesFragment {
  key: string,
  fragment : {
    tx: number | null,
    rx: number | null,
    total: number | null,
    time: TimeStamp
  }[]
}
const emptyData = {
  timeSeries: {
    ports: [],
    time: []
  },
  portCount: 0
}

const transformTimeSeriesChartData = (data: EdgeAllPortTrafficData): TimeSeriesChartData[] => {
  return data.timeSeries.ports.map((traffic, index) => {
    return {
      key: `Port ${index + 1}`,
      name: `Port ${index + 1}`,
      data: _.zip(data.timeSeries.time, traffic.total) as [TimeStamp, number | null][]
    }
  })
}

const transformTrafficSeriesFragment = (data: EdgeAllPortTrafficData): TrafficSeriesFragment[] => {
  return data.timeSeries.ports.map((traffic, index) => {
    return {
      key: `Port ${index + 1}`,
      // eslint-disable-next-line max-len
      fragment: _.zipWith(traffic.total, traffic.rx, traffic.tx, data.timeSeries.time, (total, rx, tx, time) => {
        return {
          total,
          rx,
          tx,
          time
        }
      })
    }
  })
}

export function EdgeTrafficByVolumeWidget () {
  const { $t } = useIntl()
  const filters = useDateFilter()
  const params = useParams()

  const { data: queryResults = emptyData, isLoading } = useGetEdgePortTrafficQuery({
    params: { serialNumber: params.serialNumber },
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M')
    } as EdgeTimeSeriesPayload
  })

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

        return renderToString(<RawIntlProvider value={intl}>
          <TooltipWrapper maxWidth={300}>
            <time dateTime={new Date(time).toJSON()}>
              {formatter(DateFormatEnum.DateTimeFormat)(time) as string}
            </time>
            <ul>
              {!_.isEmpty(queryResults.timeSeries.time) &&
                transformTrafficSeriesFragment(queryResults)
                  .map((traffic: TrafficSeriesFragment)=> {
                    // eslint-disable-next-line max-len
                    const color = graphParameters.find(p => p.seriesName === traffic.key)?.color || ''
                    const fragment = traffic.fragment[graphDataIndex]
                    return (
                      <li key={traffic.key}>
                        <Badge
                          className='acx-chart-tooltip'
                          color={(color) as string}
                          text={<FormattedMessage
                            defaultMessage='{name}: <b>{value}</b>'
                            description='Label before colon, value after colon'
                            values={{
                              ...defaultRichTextFormatValues,
                              name: traffic.key,
                              value: `${formatter('bytesFormat')(fragment.total)}\
                                 (Tx: ${formatter('bytesFormat')(fragment.tx)},\
                                 Rx: ${formatter('bytesFormat')(fragment.rx)})`
                            }}
                          />}
                        />
                      </li>
                    )
                  })
              }
            </ul>
          </TooltipWrapper>
        </RawIntlProvider>)
      }
    } as TooltipComponentOption
  }

  return (
    <Loader states={[{ isLoading }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <AutoSizer>
          { _.isEmpty(queryResults.timeSeries.time) ?
            () =><NoData />:
            ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={transformTimeSeriesChartData(queryResults)}
                dataFormatter={formatter('bytesFormat')}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}