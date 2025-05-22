import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'
import AutoSizer        from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData }        from '@acx-ui/components'
import type { DonutChartData }                                    from '@acx-ui/components'
import { useIotControllerLicenseStatusQuery }                     from '@acx-ui/rc/services'
import { RcapLicenseUtilizationEnum, RcapLicenseUtilizationData } from '@acx-ui/rc/utils'
import { useParams }                                              from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getRcapLicenseUtilizationDonutChartData = (rcapSummary?: RcapLicenseUtilizationData): DonutChartData[] => {
  const seriesMapping = [
    { key: RcapLicenseUtilizationEnum.USED,
      name: 'Used',
      color: cssStr('--acx-semantics-blue-50') },
    { key: RcapLicenseUtilizationEnum.AVAILABLE,
      name: 'Available',
      color: cssStr('--acx-semantics-orange-50') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []
  if (rcapSummary) {
    seriesMapping.forEach(({ key, name, color }) => {
      if (rcapSummary[key as keyof RcapLicenseUtilizationData]) {
        chartData.push({
          name,
          value: rcapSummary[key as keyof RcapLicenseUtilizationData] as number,
          color
        })
      }
    })
  }
  return chartData
}

export function RcapLicenseUtilization () {
  const { $t } = useIntl()

  const overviewQuery = useIotControllerLicenseStatusQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getRcapLicenseUtilizationDonutChartData(data),
      ...rest
    })
  })

  const { data } = overviewQuery

  const subTitle = <Space style={{ width: 'max-content' }}>
    <Badge
      color={cssStr('--acx-semantics-blue-50')}
      text={$t({ defaultMessage: 'Used' })}
    />
    <Badge
      color={cssStr('--acx-semantics-orange-50')}
      text={$t({ defaultMessage: 'Available' })}
    />
  </Space>

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'RCAP License Utilization' })}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0)
              ? <UI.Container>
                <DonutChart
                  style={{ width, height: height - 50 }}
                  size={'medium'}
                  data={data}/>
                {subTitle}
              </UI.Container>
              : <NoActiveData text={$t({ defaultMessage: 'No RCAP License Utilization' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
