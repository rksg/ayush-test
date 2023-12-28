import { useState } from 'react'

import { Col, Row, Select }   from 'antd'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { IntlShape, useIntl } from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'

import { BarChartData, calculateGranularity, getBarChartSeriesData }                from '@acx-ui/analytics/utils'
import { BarChart, EventParams, HistoricalCard, Loader, NoData, cssNumber, cssStr } from '@acx-ui/components'
import { formatter, intlFormats }                                                   from '@acx-ui/formatter'
import { useGetEdgesTopResourcesQuery }                                             from '@acx-ui/rc/services'
import { EdgesTopResources }                                                        from '@acx-ui/rc/utils'
import { NavigateFunction, Path, useNavigate, useTenantLink }                       from '@acx-ui/react-router-dom'
import { FilterNameNode }                                                           from '@acx-ui/utils'
import type { AnalyticsFilter }                                                     from '@acx-ui/utils'

export { TopEdgesByResourcesWidget as TopEdgesByResources }

function edgeResourcesFormatter (intl: IntlShape, type: string) {
  return (params: CallbackDataParams): string => {
    const { $t } = intl
    const percentage = Array.isArray(params.data) && params.data[2]
    const usage = Array.isArray(params.data) && params.data[3]
    return type === 'cpu' ?
      '{percentage|' +
      $t(intlFormats.percentFormat, { value: Number(percentage) / 100 }) + '}':
      '{usedBytes|' + formatter('bytesFormat')(usage) + '} {percentage|(' +
      $t(intlFormats.percentFormat, { value: Number(percentage) / 100 }) + ')}'
  }
}

const getEdgeResourcesRichStyle = (type: string) => (
  type === 'cpu' ?
    {
      percentage: {
        color: cssStr('--acx-primary-black'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-4-font-size'),
        lineHeight: cssNumber('--acx-body-4-line-height'),
        fontWeight: cssNumber('--acx-body-font-weight-bold')
      }
    }
    :
    {
      usedBytes: {
        color: cssStr('--acx-primary-black'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-4-font-size'),
        lineHeight: cssNumber('--acx-body-4-line-height'),
        fontWeight: cssNumber('--acx-body-font-weight-bold')
      },
      percentage: {
        color: cssStr('--acx-primary-black'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-body-5-font-size'),
        lineHeight: cssNumber('--acx-body-4-line-height'),
        fontWeight: cssNumber('--acx-body-font-weight')
      }
    }
)

const seriesMapping: BarChartData['seriesEncode'] = [
  { x: 'percentage', y: 'name' }
]

export const onClick = (navigate: NavigateFunction, basePath: Path) => {
  return (params: EventParams) => {
    const serial = params.componentType ==='series' && Array.isArray(params.value)
      && params.value[1]
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${serial}/details/overview`
    })
  }
}

function TopEdgesByResourcesWidget ({ filters }: { filters : AnalyticsFilter }) {
  const intl = useIntl()
  const basePath = useTenantLink('/devices/edge/')
  const navigate = useNavigate()
  const [currentDataType, setCurrentDataType] = useState('disk')
  const queryResults = useGetEdgesTopResourcesQuery({
    payload: {
      start: filters?.startDate,
      end: filters?.endDate,
      granularity: calculateGranularity(filters?.startDate, filters?.endDate, 'PT15M'),
      venueIds: filters?.filter?.networkNodes?.flatMap(
        item => item.map(v => (v as FilterNameNode).name)
      )
    }
  },
  {
    selectFromResult: ({ data, ...rest }) => {
      const resourcesData = data?.[currentDataType as keyof EdgesTopResources] as {
        [key: string]: string | number
      }[]
      const transferedResult = resourcesData?.map(item => ({
        name: item.name,
        serial: item.serial,
        percentage: item.percentage,
        ...(currentDataType !== 'cpu' && { usedBytes: item.usedBytes })
      })) || []
      return{
        data: getBarChartSeriesData(transferedResult,seriesMapping, 'name'),
        ...rest
      }
    }
  })
  const { data } = queryResults

  const options = [
    {
      label: intl.$t({ defaultMessage: 'Storage Usage' }),
      value: 'disk'
    },
    {
      label: intl.$t({ defaultMessage: 'CPU Usage' }),
      value: 'cpu'
    },
    {
      label: intl.$t({ defaultMessage: 'Memory Usage' }),
      value: 'memory'
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard
        title={intl.$t({ defaultMessage: 'Top 5 SmartEdges by Resource Utilization' })}
      >
        <Row justify='end'>
          <Col>
            <Select
              defaultValue='disk'
              options={options}
              onChange={(value) => setCurrentDataType(value)}
            />
          </Col>
        </Row>
        <AutoSizer>
          {({ height, width }) => (
            data && data.source?.length
              ?
              <BarChart
                data={data}
                grid={{ top: '10%',right: '17%' }}
                labelFormatter={edgeResourcesFormatter(intl, currentDataType)}
                labelRichStyle={getEdgeResourcesRichStyle(currentDataType)}
                onClick={onClick(navigate,basePath)}
                style={{ width, height: height * 0.9 }}
              />:
              <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}