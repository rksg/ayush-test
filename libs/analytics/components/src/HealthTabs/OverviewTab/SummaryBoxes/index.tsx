import { defineMessage } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { useTrafficQuery } from './services'

export const SummaryBoxes = ({ filters }: {
  filters: AnalyticsFilter,
}) => {
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const { data: trafficSummary, ...trafficQueryState } = useTrafficQuery(payload,
    { selectFromResult: ({ data, ...rest }) => {
      const apTotalTraffic = data?.network?.hierarchyNode.apTotalTraffic
      const switchTotalTraffic = data?.network?.hierarchyNode.switchTotalTraffic
      return {
        ...rest,
        data: {
          apTotalTraffic,
          switchTotalTraffic
        }
      }
    } })
  const mapping: StatsCardProps[] = [
    {
      // TODO: integrate with api
      type: 'green',
      title: defineMessage({ defaultMessage: 'Utilization' }),
      values: [{
        title: defineMessage({ defaultMessage: 'Client/AP' }),
        value: '5'
      },
      {
        title: defineMessage({ defaultMessage: 'Switches ports in use' }),
        value: '10/100'
      }]
    },
    {
      // TODO: integrate with api
      type: 'red',
      title: defineMessage({ defaultMessage: 'Incidents by' }),
      values: [{
        title: defineMessage({ defaultMessage: 'APs' }),
        value: '450 TB'
      },
      {
        title: defineMessage({ defaultMessage: 'Switches' }),
        value: '227 TB'
      }]
    },
    {
      type: 'yellow',
      title: defineMessage({ defaultMessage: 'Total Traffic' }),
      values: [{
        title: defineMessage({ defaultMessage: 'APs' }),
        value: trafficSummary.apTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.apTotalTraffic).split(' ')[0] : noDataDisplay,
        suffix: trafficSummary.apTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.apTotalTraffic).split(' ')[1] : undefined
      },
      {
        title: defineMessage({ defaultMessage: 'Switches' }),
        value: trafficSummary.switchTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.switchTotalTraffic).split(' ')[0] : noDataDisplay,
        suffix: trafficSummary.switchTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.switchTotalTraffic).split(' ')[1] : undefined
      }]
    },
    {
      // TODO: integrate with api
      type: 'grey',
      title: defineMessage({ defaultMessage: 'PoE' }),
      values: [{
        title: defineMessage({ defaultMessage: 'Wireless' }),
        value: 'X%'
      },
      {
        title: defineMessage({ defaultMessage: 'Wired' }),
        value: 'Y1'
      }]
    }
  ]

  return (
    <Loader states={[trafficQueryState]}>
      <GridRow>
        {mapping.map((stat)=>
          <GridCol key={stat.type} col={{ span: 24/mapping.length }}>
            <StatsCard {...stat} />
          </GridCol>
        )}
      </GridRow>
    </Loader>
  )
}
