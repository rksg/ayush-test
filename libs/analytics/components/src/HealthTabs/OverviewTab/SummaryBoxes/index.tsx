import { defineMessage } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { useIncidentsQuery, useTrafficQuery, useUtilizationQuery } from './services'

export const SummaryBoxes = ({ filters }: {
  filters: AnalyticsFilter,
}) => {
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const { data: trafficSummary, ...trafficQueryState } = useTrafficQuery(payload,
    {
      selectFromResult: ({ data, ...rest }) => {
        return {
          ...rest,
          data: {
            apTotalTraffic: data?.network?.hierarchyNode.apTotalTraffic,
            switchTotalTraffic: data?.network?.hierarchyNode.switchTotalTraffic
          }
        }
      }
    })

  const { data: incidentsSummary, ...incidentsQueryState } = useIncidentsQuery(payload,
    {
      selectFromResult: ({ data, ...rest }) => {
        return {
          ...rest,
          data: {
            apIncidentCount: data?.network?.hierarchyNode.apIncidentCount,
            switchIncidentCount: data?.network?.hierarchyNode.switchIncidentCount
          }
        }
      }
    })

  const { data: utilizationSummary, ...utilizationQueryState } = useUtilizationQuery(payload,
    {
      selectFromResult: ({ data, ...rest }) => {
        return {
          ...rest,
          data: {
            avgClientCountPerAp: data?.network?.hierarchyNode.avgClientCountPerAp,
            portCount: data?.network?.hierarchyNode.portCount,
            totalPortCount: data?.network?.hierarchyNode.totalPortCount
          }
        }
      }
    })

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      title: defineMessage({ defaultMessage: 'Utilization' }),
      values: [{
        title: defineMessage({ defaultMessage: 'Client/AP' }),
        value: utilizationSummary.avgClientCountPerAp ?
          formatter('countFormat')(utilizationSummary.avgClientCountPerAp) : noDataDisplay
      },
      {
        title: defineMessage({ defaultMessage: 'Switches ports in use' }),
        value: `${utilizationSummary.portCount ?
          formatter('countFormat')(utilizationSummary.portCount)
          : noDataDisplay}`,
        suffix: `/${utilizationSummary.totalPortCount ?
          formatter('countFormat')(utilizationSummary.totalPortCount) : noDataDisplay}`
      }]
    },
    {
      type: 'red',
      title: defineMessage({ defaultMessage: 'Incidents' }),
      values: [{
        title: defineMessage({ defaultMessage: 'APs' }),
        value: incidentsSummary.apIncidentCount ?
          formatter('countFormat')(incidentsSummary.apIncidentCount).split(' ')[0] : noDataDisplay,
        suffix: incidentsSummary.apIncidentCount ?
          formatter('countFormat')(incidentsSummary.apIncidentCount).split(' ')[1] : undefined
      },
      {
        title: defineMessage({ defaultMessage: 'Switches' }),
        value: incidentsSummary.switchIncidentCount ?
          formatter('countFormat')(incidentsSummary.switchIncidentCount).split(' ')[0]
          : noDataDisplay,
        suffix: incidentsSummary.switchIncidentCount ?
          formatter('countFormat')(incidentsSummary.switchIncidentCount).split(' ')[1] : undefined
      }]
    },
    {
      type: 'yellow',
      title: defineMessage({ defaultMessage: 'Total Traffic' }),
      values: [{
        title: defineMessage({ defaultMessage: 'Wireless' }),
        value: trafficSummary.apTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.apTotalTraffic).split(' ')[0] : noDataDisplay,
        suffix: trafficSummary.apTotalTraffic ?
          formatter('bytesFormat')(trafficSummary.apTotalTraffic).split(' ')[1] : undefined
      },
      {
        title: defineMessage({ defaultMessage: 'Wired' }),
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
    <Loader states={[trafficQueryState, incidentsQueryState, utilizationQueryState]}>
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
