import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                             from '@acx-ui/components'
import { useIotControllerDashboardQuery }                  from '@acx-ui/rc/services'
import { IotControllerDashboard }                          from '@acx-ui/rc/utils'
import { useParams }                                       from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getAssociatedVenuesDonutChartData = (overviewData?: IotControllerDashboard): DonutChartData[] => {
  const seriesMapping = [
    { key: 'Venues',
      name: 'Venues',
      color: cssStr('--acx-semantics-green-50') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []
  const apsSummary = overviewData?.summary?.associatedVenues?.summary
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

export function AssociatedVenues () {
  const { $t } = useIntl()

  const overviewQuery = useIotControllerDashboardQuery({
    params: useParams()
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getAssociatedVenuesDonutChartData(data),
      ...rest
    })
  })

  const { data } = overviewQuery

  return (
    <Loader states={[overviewQuery]}>
      <Card title={$t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' })}>
        <AutoSizer>
          {({ height, width }) => (
            (data && data.length > 0)
              ? <UI.Container>
                <DonutChart
                  style={{ width, height: height - 50 }}
                  size={'medium'}
                  data={data}/>
              </UI.Container>
              // eslint-disable-next-line max-len
              : <NoActiveData text={$t({ defaultMessage: 'No Associated <VenuePlural></VenuePlural>' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
