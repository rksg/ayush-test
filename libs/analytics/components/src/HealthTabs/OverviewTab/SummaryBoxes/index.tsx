import { defineMessage } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { useSummaryDataQuery } from './services'

export const SummaryBoxes = ({ filters, wirelessOnly }: {
  filters: AnalyticsFilter, wirelessOnly: boolean
}) => {
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate,
    wirelessOnly
  }

  const { data: summaryData, ...summaryQueryState } = useSummaryDataQuery(payload)
  const formatValue = (value: number | undefined) => {
    if (value == null) return noDataDisplay
    return formatter('countFormat')(value)
  }


  const utilization : StatsCardProps['values'] = [{
    title: defineMessage({ defaultMessage: 'Avg. clients per AP' }),
    value: formatValue(summaryData?.avgPerAPClientCount)
  }]

  !wirelessOnly && utilization.push(
    {
      title: defineMessage({ defaultMessage: 'Switch ports in use' }),
      value: formatValue(summaryData?.portCount),
      suffix: `/${formatValue(summaryData?.totalPortCount)}`
    }
  )

  const incidents : StatsCardProps['values'] = [{
    title: defineMessage({ defaultMessage: 'APs' }),
    value: formatValue(summaryData?.apIncidentCount)
  }]

  !wirelessOnly && incidents.push(
    {
      title: defineMessage({ defaultMessage: 'Switches' }),
      value: formatValue(summaryData?.switchIncidentCount)
    }
  )
  const traffic = [{
    title: defineMessage({ defaultMessage: 'Wireless' }),
    value: summaryData?.apTotalTraffic ?
      formatter('bytesFormat')(summaryData?.apTotalTraffic).split(' ')[0] : noDataDisplay,
    suffix: summaryData?.apTotalTraffic ?
      formatter('bytesFormat')(summaryData?.apTotalTraffic).split(' ')[1] : undefined
  }]

  !wirelessOnly && traffic.push(
    {
      title: defineMessage({ defaultMessage: 'Wired' }),
      value: summaryData?.switchTotalTraffic ?
        formatter('bytesFormat')(summaryData?.switchTotalTraffic).split(' ')[0] : noDataDisplay,
      suffix: summaryData?.switchTotalTraffic ?
        formatter('bytesFormat')(summaryData?.switchTotalTraffic).split(' ')[1] : undefined
    }
  )
  const powerUtilization = [{
    title: defineMessage({ defaultMessage: 'Insufficient powered APs' }),
    value: formatValue(summaryData?.poeUnderPoweredApCount),
    suffix: `/${formatValue(summaryData?.apCount)}`
  }]

  !wirelessOnly && powerUtilization.push(
    {
      title: defineMessage({ defaultMessage: 'Switches under PoE threshold' }),
      value: formatValue(summaryData?.poeUnderPoweredSwitchCount),
      suffix: `/${formatValue(summaryData?.poeThresholdSwitchCount)}`
    }
  )

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      title: defineMessage({ defaultMessage: 'Utilization' }),
      values: utilization
    },
    {
      type: 'red',
      title: defineMessage({ defaultMessage: 'Incidents' }),
      values: incidents
    },
    {
      type: 'yellow',
      title: defineMessage({ defaultMessage: 'Total Traffic' }),
      values: traffic
    },
    {
      type: 'grey',
      title: defineMessage({ defaultMessage: 'Power Utilization' }),
      values: powerUtilization
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
