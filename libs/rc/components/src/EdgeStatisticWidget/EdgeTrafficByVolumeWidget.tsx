import _                                             from 'lodash'
import { renderToString }                            from 'react-dom/server'
import { RawIntlProvider, useIntl,FormattedMessage } from 'react-intl'
import AutoSizer                                     from 'react-virtualized-auto-sizer'

import type { TimeSeriesChartData } from '@acx-ui/analytics/utils'
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
import { formatter, DateFormatEnum } from '@acx-ui/formatter'
import type { TimeStamp }            from '@acx-ui/types'
import { getIntl }                   from '@acx-ui/utils'

import { EdgeTrafficByVolumeWidgetMockData } from './__test__/fixture'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

interface TrafficResponse {
  time: TimeStamp[],
  timeSeries: {
    tx: number[],
    rx: number[],
    total: number[]
  }[]
}

interface TrafficSeriesFragment {
  key: string,
  fragment : {
    tx: number | null,
    rx: number | null,
    total: number | null,
    time: TimeStamp
  }[]
}

const transformTimeSeriesChartData = (data: TrafficResponse): TimeSeriesChartData[] => {
  return data.timeSeries.map((traffic, index) => {
    return {
      key: `Port ${index + 1}`,
      name: `Port ${index + 1}`,
      data: _.zip(data.time, traffic.total) as [TimeStamp, number | null][]
    }
  })
}

const transformTrafficSeriesFragment = (data: TrafficResponse): TrafficSeriesFragment[] => {
  return data.timeSeries.map((traffic, index) => {
    return {
      key: `Port ${index + 1}`,
      // eslint-disable-next-line max-len
      fragment: _.zipWith(traffic.total, traffic.rx, traffic.tx, data.time, (total, rx, tx, time) => {
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

function EdgeTrafficByVolumeWidget () {
  const { $t } = useIntl()
  const queryResults = { data: EdgeTrafficByVolumeWidgetMockData, isLoading: false }

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
              <ul>{
                // eslint-disable-next-line max-len
                transformTrafficSeriesFragment(queryResults.data as TrafficResponse).map((traffic: TrafficSeriesFragment)=> {
                  const color = graphParameters.find(p => p.seriesName === traffic.key)?.color || ''
                  const fragment = traffic.fragment[graphDataIndex]
                  let text = <FormattedMessage
                    defaultMessage='{name}: <b>{value}</b>'
                    description='Label before colon, value after colon'
                    values={{
                      ...defaultRichTextFormatValues,
                      name: traffic.key,
                      value: formatter('concatTxAndRxFormat')(fragment)
                    }}
                  />
                  return (
                    <li key={traffic.key}>
                      <Badge
                        className='acx-chart-tooltip'
                        color={(color) as string}
                        text={text}
                      />
                    </li>
                  )
                })
              }</ul>
            </TooltipWrapper>
          </RawIntlProvider>
        )
      }
    } as TooltipComponentOption
  }


  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={transformTimeSeriesChartData(queryResults.data as TrafficResponse)}
                dataFormatter={formatter('bytesFormat')}
                echartOptions={defaultOption}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}

export { EdgeTrafficByVolumeWidget }