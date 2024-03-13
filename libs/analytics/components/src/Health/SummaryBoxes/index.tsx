import { isNull }                 from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { GridRow, GridCol, Loader, StatsCard, StatsCardProps } from '@acx-ui/components'
import { formatter, intlFormats }                              from '@acx-ui/formatter'
import type { AnalyticsFilter }                                from '@acx-ui/utils'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { DrilldownSelection } from '../HealthDrillDown/config'

import { useSummaryQuery } from './services'

export const SummaryBoxes = ({ filters, drilldownSelection, setDrilldownSelection }: {
  filters: AnalyticsFilter,
  drilldownSelection: DrilldownSelection,
  setDrilldownSelection: (val: DrilldownSelection) => void
}) => {
  const intl = useIntl()
  const { $t } = intl
  const payload = {
    filter: filters.filter,
    start: filters.startDate,
    end: filters.endDate
  }
  const toggleConnectionFailure = () => setDrilldownSelection(
    drilldownSelection !== 'connectionFailure' ? 'connectionFailure' : null
  )
  const toggleTtc = () => setDrilldownSelection(drilldownSelection !== 'ttc' ? 'ttc' : null)

  const queryResults = useSummaryQuery(payload, {
    selectFromResult: ({ data, ...rest }) => {
      const [ averageTtc ] = data?.network?.avgTTC.incidentCharts.ttc || [null]
      const [ successCount, totalCount ] = data?.network?.timeSeries
        .connectionSuccessAndAttemptCount[0] || [null, null]

      const successPercentage = (
        !isNull(successCount) &&
        !isNull(totalCount) &&
        totalCount !== 0
      )
        ? $t(intlFormats.percentFormat, { value: (successCount / totalCount) })
        : noDataDisplay
      const failureCount = !isNull(totalCount) && !isNull(successCount)
        ? totalCount - successCount
        : null

      return {
        ...rest,
        data: {
          totalCount: isNull(totalCount)
            ? noDataDisplay : $t(intlFormats.countFormat, { value: totalCount }),
          successCount: isNull(successCount)
            ? noDataDisplay : $t(intlFormats.countFormat, { value: successCount }),
          failureCount: isNull(failureCount)
            ? noDataDisplay : $t(intlFormats.countFormat, { value: failureCount }),
          successPercentage,
          averageTtc: isNull(averageTtc)
            ? noDataDisplay : formatter('durationFormat')(averageTtc) as string
        }
      }
    }
  })

  const mapping: StatsCardProps[] = [
    {
      type: 'green',
      values: [{
        title: defineMessage({ defaultMessage: 'Successful Connections' }),
        value: queryResults.data.successCount,
        suffix: `/${queryResults.data.totalCount}`
      }],
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure
    },
    {
      type: 'red',
      values: [{
        title: defineMessage({ defaultMessage: 'Failed Connections' }),
        value: queryResults.data.failureCount,
        suffix: `/${queryResults.data.totalCount}`
      }],
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure
    },
    {
      type: 'yellow',
      values: [{
        title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
        value: queryResults.data.successPercentage
      }],
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure
    },
    {
      type: 'grey',
      values: [{
        title: defineMessage({ defaultMessage: 'Average Time To Connect' }),
        value: queryResults.data.averageTtc
      }],
      isOpen: drilldownSelection === 'ttc',
      onClick: toggleTtc
    }
  ]

  return (
    <Loader states={[queryResults]}>
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
