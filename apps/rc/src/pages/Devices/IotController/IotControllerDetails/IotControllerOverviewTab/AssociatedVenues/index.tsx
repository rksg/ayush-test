import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader , Card, DonutChart, NoActiveData } from '@acx-ui/components'
import type { DonutChartData }                             from '@acx-ui/components'
import { useGetIotControllerListQuery }                    from '@acx-ui/rc/services'
import { IotControllerStatus }                             from '@acx-ui/rc/utils'
import { useParams }                                       from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

// eslint-disable-next-line max-len
export const getAssociatedVenuesDonutChartData = (overviewData?: IotControllerStatus): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const apsSummary = overviewData?.assocVenueCount
  if (apsSummary) {
    chartData.push({
      name: 'Venues',
      value: apsSummary,
      color: cssStr('--acx-semantics-green-50')
    })
  }
  return chartData
}

export function AssociatedVenues () {
  const { $t } = useIntl()
  const params = useParams()

  const { availableIotControllers, isLoading } = useGetIotControllerListQuery({
    payload: {
      fields: [
        'id',
        'name',
        'inboundAddress',
        'publicAddress',
        'publicPort',
        'tenantId',
        'status',
        'assocVenueId'
      ],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: { tenantId: [params.tenantId], id: params.iotId }
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      availableIotControllers: data?.data.map(item => ({
        ...item
      })) ?? []
    })
  })

  return (
    <Loader states={[ { isLoading } ]}>
      <Card title={$t({ defaultMessage: 'Associated <VenuePlural></VenuePlural>' })}>
        <AutoSizer>
          {({ height, width }) => (
            (availableIotControllers && availableIotControllers.length > 0)
              ? <UI.Container>
                <DonutChart
                  style={{ width, height: height - 50 }}
                  size={'medium'}
                  data={getAssociatedVenuesDonutChartData(availableIotControllers[0])}/>
              </UI.Container>
              // eslint-disable-next-line max-len
              : <NoActiveData text={$t({ defaultMessage: 'No Associated <VenuePlural></VenuePlural>' })}/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
