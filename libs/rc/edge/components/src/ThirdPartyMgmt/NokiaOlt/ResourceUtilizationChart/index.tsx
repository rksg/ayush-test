import { Typography, Space }                          from 'antd'
import { zipWith, isEmpty }                           from 'lodash'
import { renderToString }                             from 'react-dom/server'
import { RawIntlProvider, useIntl, FormattedMessage } from 'react-intl'
import AutoSizer                                      from 'react-virtualized-auto-sizer'

import { getSeriesData }        from '@acx-ui/analytics/utils'
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
import { InformationOutlined }       from '@acx-ui/icons'
import { EdgeResourceTimeSeries }    from '@acx-ui/rc/utils'
import type { TimeStamp }            from '@acx-ui/types'
import { getIntl }                   from '@acx-ui/utils'

import { generateRandomChartData } from './cannedData'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

type Key = keyof Omit<EdgeResourceTimeSeries, 'time'>

export const EdgeOltResourceUtilizationWidget = ({ isLoading }: { isLoading: boolean }) => {
  const { $t } = useIntl()

  const seriesMapping = [
    { key: 'cpu', name: $t({ defaultMessage: 'CPU' }) },
    { key: 'memory', name: $t({ defaultMessage: 'Memory' }) },
    { key: 'disk', name: $t({ defaultMessage: 'Disk' }) }
  ] as Array<{ key: Key, name: string }>

  const endTime = new Date() // current time
  const dataPoints = 144 // Number of data points
  const chartData = generateRandomChartData(endTime, dataPoints)

  const queryResults = isLoading ? [] : getSeriesData(chartData, seriesMapping)

  const seriesFragment = isLoading ? [] : [
    {
      key: 'CPU',
      fragment: zipWith(
        chartData.cpu,
        chartData.time,
        (percentage, time) => {
          return {
            percentage,
            time
          }
        })
    },
    {
      key: 'Memory',
      fragment: zipWith(
        chartData.memory,
        chartData.time,
        (percentage, time) => {
          return {
            percentage,
            time
          }
        })
    },
    {
      key: 'Disk',
      fragment: zipWith(
        chartData.disk,
        chartData.time,
        (percentage, time) => {
          return {
            percentage,
            time
          }
        })
    }
  ]

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
                {
                  (
                    !isEmpty(queryResults[0].data) ||
                    !isEmpty(queryResults[1].data) ||
                    !isEmpty(queryResults[2].data)
                  ) && seriesFragment.map((resource) => {
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
                              value: `${formatter('percent')(fragment.percentage)}`
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
    <Loader states={[{ isLoading }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Resource Utilization' })}>
        <Space style={{ width: '100%' }}>
          <InformationOutlined />
          <Typography.Text type='secondary'>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'The following data is a prototype.' })
            }
          </Typography.Text >
        </Space>
        <AutoSizer>
          {(isEmpty(queryResults)|| isEmpty(queryResults[0].data)) ?
            () =><NoData />:
            ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height: height-20 }}
                data={queryResults}
                dataFormatter={formatter('percent')}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}