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
  // const formatValue = (value: number | undefined) => {
  //   if (value == null) return noDataDisplay
  //   return formatter('countFormat')(value)
  // }


  // eslint-disable-next-line no-console
  console.log('#### summaryData: ', summaryData)

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      values: [{
        title: defineMessage({ defaultMessage: 'DHCP Failure' }),
        value: !isNil(summaryData?.dhcpSuccessAttemptCount.successCount) &&
        summaryData?.dhcpSuccessAttemptCount.attemptCount
          ? formatter('percentFormat')(
            summaryData?.dhcpSuccessAttemptCount.successCount /
            summaryData?.dhcpSuccessAttemptCount.attemptCount)
          : noDataDisplay
      }],
      // eslint-disable-next-line no-console
      onClick: () => { console.log('DHCP Failure more details clicked') }
    },
    {
      type: 'red',
      values: [{
        title: defineMessage({ defaultMessage: 'Congestion' }),
        value: 'X2%'
      }],
      // eslint-disable-next-line no-console
      onClick: () => { console.log('Congestion more details clicked') }
    },
    {
      type: 'yellow',
      values: [{
        title: defineMessage({ defaultMessage: 'Ports exp. Storm' }),
        value: 'X3%'
      }],
      // eslint-disable-next-line no-console
      onClick: () => { console.log('Ports exp. Storm more details clicked') }
    },
    {
      // TODO: integrate with api
      type: 'grey',
      values: [{
        title: defineMessage({ defaultMessage: 'High CPU' }),
        value: 'X4%'
      }],
      // eslint-disable-next-line no-console
      onClick: () => { console.log('High CPU more details clicked') }
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
