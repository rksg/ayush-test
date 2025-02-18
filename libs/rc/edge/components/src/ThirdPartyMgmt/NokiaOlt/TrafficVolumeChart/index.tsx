import { useEffect, useState, useMemo } from 'react'

import { Col, Row, Typography, Space }                from 'antd'
import { zipWith, isEmpty, get, capitalize }          from 'lodash'
import { renderToString }                             from 'react-dom/server'
import { RawIntlProvider, useIntl, FormattedMessage } from 'react-intl'
import AutoSizer                                      from 'react-virtualized-auto-sizer'


import { getSeriesData } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData,
  tooltipOptions,
  TooltipFormatterParams,
  TooltipWrapper,
  Badge,
  defaultRichTextFormatValues,
  Select
} from '@acx-ui/components'
import { formatter, DateFormatEnum } from '@acx-ui/formatter'
import { InformationOutlined }       from '@acx-ui/icons'
import { EdgePortTrafficTimeSeries } from '@acx-ui/rc/utils'
import type { TimeStamp }            from '@acx-ui/types'
import { getIntl  }                  from '@acx-ui/utils'

import { generateRandomPortTrafficData } from './cannedData'

import type { EChartsOption, TooltipComponentOption } from 'echarts'

type Key = keyof Omit<EdgePortTrafficTimeSeries, 'portName'>

interface TrafficSeriesFragment {
  key: string,
  fragment : {
    value: number | null,
    time: TimeStamp
  }[]
}

const transformTrafficSeriesFragment = (data: {
  time: number[],
  tx: number[], rx: number[], total: number[]
}, seriesMapping: Array<{ key: string, name: string, show?: boolean }>
): TrafficSeriesFragment[] => {
  return seriesMapping.map(({ key: seriesKey }) => {
    return {
      key: capitalize(seriesKey),
      // eslint-disable-next-line max-len
      fragment: zipWith(
        get(data, seriesKey),
        data.time,
        (value, time) => {
          return {
            value: value as number,
            time
          }
        })
    }
  })
}

export const EdgeOltTrafficByVolumeWidget = () => {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'tx', name: $t({ defaultMessage: 'Tx' }) },
    { key: 'rx', name: $t({ defaultMessage: 'Rx' }) },
    { key: 'total', name: $t({ defaultMessage: 'Total' }) }
  ] as Array<{ key: Key, name: string }>

  const cageOptions = [
    {
      label: $t({ defaultMessage: 'S1/4' }),
      value: 'S1/4'
    },
    {
      label: $t({ defaultMessage: 'S1/6' }),
      value: 'S1/6'
    }
  ]


  const [isLoading, setIsLoading] = useState(false)
  const [currentDataType, setCurrentDataType] = useState(cageOptions[0].value)

  const endTime = new Date() // current time
  const dataPoints = 144 // Number of data points
  const cageAmount = cageOptions.length //Number of OLT UP cage

  const cagesData: Record<string, {
    time: number[],
    tx: number[], rx: number[], total: number[]
  }> = useMemo(() => {
    const mockData: Record<string, {
      time: number[],
      tx: number[], rx: number[], total: number[]
    }> = {}

    for (let i = 0; i < cageAmount; i++) {
      const cageName = cageOptions[i].value
      const chartData = generateRandomPortTrafficData(endTime, dataPoints)
      mockData[cageName] = chartData
    }

    return mockData
  }, [])

  useEffect(() => {
    const randomLoadingTime = Math.random() * 4 - 2.2
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, randomLoadingTime)
  }, [])

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
        const selectedCageData = cagesData[currentDataType]

        return renderToString(<RawIntlProvider value={intl}>
          <TooltipWrapper maxWidth={300}>
            <time dateTime={new Date(time).toJSON()}>
              {formatter(DateFormatEnum.DateTimeFormat)(time) as string}
            </time>
            <ul>
              {!isEmpty(selectedCageData.time) &&
                transformTrafficSeriesFragment(selectedCageData, seriesMapping)
                  .map((traffic: TrafficSeriesFragment, index)=> {
                    // eslint-disable-next-line max-len
                    const color = graphParameters.find(p => p.seriesName === traffic.key)?.color || ''
                    const fragment = traffic.fragment[graphDataIndex]
                    return (
                      <li key={traffic.key || `unknown_port ${index}`}>
                        <Badge
                          className='acx-chart-tooltip'
                          color={(color) as string}
                          text={<FormattedMessage
                            defaultMessage='{name}: <b>{value}</b>'
                            description='Label before colon, value after colon'
                            values={{
                              ...defaultRichTextFormatValues,
                              name: traffic.key,
                              value: `${formatter('bytesFormat')(fragment.value)}`
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
  const selectedCageData = cagesData[currentDataType]
  const queryResults = isLoading ? [] : getSeriesData(selectedCageData, seriesMapping)

  return (
    <Loader states={[{ isLoading }]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <Row justify='end' style={{ position: 'absolute', top: -35, right: 0 }}>
          <Col>
            <Select
              value={currentDataType}
              options={cageOptions}
              onChange={(value) => setCurrentDataType(value)}
            />
          </Col>
        </Row>
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
          { isEmpty(selectedCageData.time) ?
            () =><NoData />:
            ({ height, width }) =>
              <MultiLineTimeSeriesChart
                style={{ width, height: height-20 }}
                data={queryResults}
                dataFormatter={formatter('bytesFormat')}
                echartOptions={defaultOption}
              />
          }
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}