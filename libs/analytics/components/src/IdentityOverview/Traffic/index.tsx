import { useMemo } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart, DonutChartData, Loader, NoData, useDateRange } from '@acx-ui/components'
import { formats }                                                        from '@acx-ui/formatter'
import { useParams }                                                      from '@acx-ui/react-router-dom'

import { useTrafficQuery } from './services'

export const Traffic = () => {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()
  const { personaId: identityId, personaGroupId: identityGroupId } = useParams()
  const queryResults = useTrafficQuery({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    range: selectedRange,
    filter: {},
    identityFilter: { identityId, identityGroupId }
  })

  const data: Array<DonutChartData> = useMemo(
    () => [
      {
        name: $t({ defaultMessage: 'Rx Traffic' }),
        value: queryResults.data?.userRxTraffic ?? 0
      },
      {
        name: $t({ defaultMessage: 'Tx  Traffic' }),
        value: queryResults.data?.userTxTraffic ?? 0
      }
    ],
    [$t, queryResults.data?.userRxTraffic, queryResults.data?.userTxTraffic]
  )

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Traffic' })}>
        <AutoSizer>
          {({ width, height }) => (
            data.every((item) => item.value === 0) ? (
              <NoData />
            ) : (
              <DonutChart
                style={{ width, height }}
                title={$t({ defaultMessage: 'User Traffic' })}
                data={data}
                showLabel
                dataFormatter={(value) => formats.bytesFormat(value as number)}
                labelFormat='name-bold-value'
              />
            )
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
