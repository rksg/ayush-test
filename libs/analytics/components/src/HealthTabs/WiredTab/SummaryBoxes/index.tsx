import { isNil }         from 'lodash'
import { defineMessage } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { useWiredSummaryDataQuery } from './services'

export const SummaryBoxes = ({ filters }: { filters: AnalyticsFilter }) => {
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }

  const { data: summaryData, ...summaryQueryState } = useWiredSummaryDataQuery(payload)

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      values: [{
        title: defineMessage({ defaultMessage: 'DHCP Failure' }),
        value: !isNil(summaryData?.switchDHCP.successCount) &&
        summaryData?.switchDHCP.attemptCount
          ? formatter('percentFormat')(
            (summaryData?.switchDHCP.attemptCount - summaryData?.switchDHCP.successCount)
        / summaryData?.switchDHCP.attemptCount )
          : noDataDisplay
      }],
      onClick: () => { }
    },
    {
      type: 'red',
      values: [{
        title: defineMessage({ defaultMessage: 'Congestion' }),
        value: 'X2%'
      }],
      onClick: () => { }
    },
    {
      type: 'yellow',
      values: [{
        title: defineMessage({ defaultMessage: 'Ports exp. Storm' }),
        value: 'X3%'
      }],
      onClick: () => { }
    },
    {
      type: 'grey',
      values: [{
        title: defineMessage({ defaultMessage: 'High CPU' }),
        value: !isNil(summaryData?.switchCpuUtilizationPct)
          ? formatter('percentFormat')(summaryData?.switchCpuUtilizationPct)
          : noDataDisplay
      }],
      onClick: () => { }
    }
  ]

  return (
    <Loader states={[summaryQueryState]}>
      <GridRow>
        {mapping.map((stat) =>
          <GridCol key={stat.type} col={{ span: 24 / mapping.length }}>
            <StatsCard {...stat} />
          </GridCol>
        )}
      </GridRow>
    </Loader>
  )
}
