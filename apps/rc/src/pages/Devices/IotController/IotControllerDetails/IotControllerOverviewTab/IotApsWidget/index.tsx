import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'
import AutoSizer        from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                             from '@acx-ui/components'
import { useIotControllerPluginsQuery }                    from '@acx-ui/rc/services'
import { IotApStatusEnum, IotControllerDashboard }         from '@acx-ui/rc/utils'
import { useParams }                                       from '@acx-ui/react-router-dom'
// import { useIotControllerDashboardQuery }                  from '@acx-ui/rc/services'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getIotApsDonutChartData = (overviewData?: IotControllerDashboard): DonutChartData[] => {
  const seriesMapping = [
    { key: IotApStatusEnum.ONLINE,
      name: 'Online',
      color: cssStr('--acx-semantics-green-50') },
    { key: IotApStatusEnum.OFFLINE,
      name: 'Offline',
      color: cssStr('--acx-semantics-red-50') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []
  const apsSummary = overviewData?.summary?.aps?.summary
  if (apsSummary) {
    seriesMapping.forEach(({ key, name, color }) => {
      if (apsSummary[key]) {
        chartData.push({
          name,
          value: apsSummary[key],
          color
        })
      }
    })
  }
  return chartData
}

export function IotApsWidget () {
  const { $t } = useIntl()

  // const overviewQuery = useIotControllerDashboardQuery({
  //   params: useParams()
  // }, {
  //   selectFromResult: ({ data, ...rest }) => ({
  //     data: getIotApsDonutChartData(data),
  //     ...rest
  //   })
  // })

  const overviewQuery = useIotControllerPluginsQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: [],
      ...rest
    })
  })

  const { data } = overviewQuery

  const subTitle = <Space style={{ width: 'max-content' }}>
    <Badge
      color={cssStr('--acx-semantics-green-50')}
      text={$t({ defaultMessage: 'Online' })}
    />
    <Badge
      color={cssStr('--acx-semantics-red-50')}
      text={$t({ defaultMessage: 'Offline' })}
    />
  </Space>

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'IoT APs' })}>
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
              : <NoActiveData text={$t({ defaultMessage: 'No IoT APs' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
