import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { formatter, intlFormats }   from '@acx-ui/formatter'
import type { AnalyticsFilter }     from '@acx-ui/utils'
import { noDataDisplay }            from '@acx-ui/utils'

import { DrilldownSelection } from '../HealthDrillDown/config'

import { useSummaryQuery }                        from './services'
import { Wrapper, Statistic, UpArrow, DownArrow } from './styledComponents'


interface BoxProps {
  type: string,
  title: MessageDescriptor
  value: string
  suffix?: string
  isOpen: boolean
  onClick: () => void
}

export const Box = (props: BoxProps) => {
  const { $t } = useIntl()
  const box = <Wrapper
    $type={props.type}
    $isOpen={props.isOpen}
    onClick={props.onClick}
  >
    <Statistic
      $type={props.type}
      title={$t(props.title)}
      value={props.value}
      suffix={props.suffix}
    />
    {props.isOpen
      ? <UpArrow $type={props.type}/>
      : <DownArrow $type={props.type}/>
    }
  </Wrapper>
  return box
}

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

  const mapping: BoxProps[] = [
    {
      type: 'successCount',
      title: defineMessage({ defaultMessage: 'Successful Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.successCount
    },
    {
      type: 'failureCount',
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.failureCount
    },
    {
      type: 'successPercentage',
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
      isOpen: drilldownSelection === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.successPercentage
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg Time To Connect' }),
      isOpen: drilldownSelection === 'ttc',
      onClick: toggleTtc,
      value: queryResults.data.averageTtc
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <GridRow>
        {mapping.map((box)=>
          <GridCol key={box.type} col={{ span: 6 }}>
            <Box {...box} />
          </GridCol>
        )}
      </GridRow>
    </Loader>
  )
}
