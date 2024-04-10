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

  const utilization : StatsCardProps['values'] = [{
    title: defineMessage({ defaultMessage: 'Avg. clients per AP' }),
    value: formatter('countFormat')(summaryData?.avgPerAPClientCount)
  }]

  !wirelessOnly && utilization.push(
    {
      title: defineMessage({ defaultMessage: 'Switch ports in use' }),
      value: formatter('countFormat')(summaryData?.portCount),
      suffix: `/${formatter('countFormat')(summaryData?.totalPortCount)}`
    }
  )

  const incidents : StatsCardProps['values'] = [{
    title: defineMessage({ defaultMessage: 'APs' }),
    value: formatter('countFormat')(summaryData?.apIncidentCount)
  }]

  !wirelessOnly && incidents.push(
    {
      title: defineMessage({ defaultMessage: 'Switches' }),
      value: formatter('countFormat')(summaryData?.switchIncidentCount)
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
    title: defineMessage({ defaultMessage: 'Wireless' }),
    value: 'X%'
  }]

  !wirelessOnly && powerUtilization.push(
    {
      title: defineMessage({ defaultMessage: 'Wired' }),
      value: 'Y1'
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
      // TODO: integrate with api
      type: 'grey',
      title: defineMessage({ defaultMessage: 'PoE' }),
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
