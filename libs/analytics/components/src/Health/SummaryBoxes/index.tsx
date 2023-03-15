import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader }      from '@acx-ui/components'
import { formatter, intlFormats }        from '@acx-ui/utils'

import { useSummaryQuery }                        from './services'
import { Wrapper, Statistic, UpArrow, DownArrow } from './styledComponents'


interface BoxProps {
  type: string,
  title: MessageDescriptor
  value: string
  suffix?: string
  isOpen: boolean
  toggleEnable: boolean
  onClick: () => void
}

export const Box = (props: BoxProps) => {
  const { $t } = useIntl()
  const box = <Wrapper
    $type={props.type}
    onClick={props.onClick}
  >
    <Statistic
      $type={props.type}
      title={$t(props.title)}
      value={props.value}
      suffix={props.suffix}
    />
    {props.toggleEnable
      ? (props.isOpen)
        ? <UpArrow $type={props.type}/>
        : <DownArrow $type={props.type}/>
      : null}
  </Wrapper>
  return box
}

export const SummaryBoxes = ({ filters, toggleEnable, openType, setOpenType }: {
  filters: AnalyticsFilter,
  openType: 'connectionFailure' | 'ttc' | 'none',
  setOpenType: (val: 'connectionFailure' | 'ttc' | 'none') => void,
  toggleEnable: boolean
}) => {
  const intl = useIntl()
  const { $t } = intl
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }

  const toggleConnectionFailure = () => setOpenType(openType !== 'connectionFailure'
    ? 'connectionFailure' : 'none')
  const toggleTtc = () => setOpenType(openType !== 'ttc' ? 'ttc' : 'none')

  const queryResults = useSummaryQuery(payload, {
    selectFromResult: ({ data, ...rest }) => {
      const [ averageTtc ] = data?.avgTTC.hierarchyNode.incidentCharts.ttc || [null]
      const [ successCount, totalCount ] = data?.timeSeries
        .connectionSuccessAndAttemptCount[0] || [null, null]

      const successPercentage = (
        !isNull(successCount) &&
        !isNull(totalCount) &&
        totalCount !== 0
      )
        ? $t(intlFormats.percentFormat, { value: (successCount / totalCount) })
        : noDataSymbol
      const failureCount = !isNull(totalCount) && !isNull(successCount)
        ? totalCount - successCount
        : null

      return {
        ...rest,
        data: {
          totalCount: isNull(totalCount)
            ? noDataSymbol : $t(intlFormats.countFormat, { value: totalCount }),
          successCount: isNull(successCount)
            ? noDataSymbol : $t(intlFormats.countFormat, { value: successCount }),
          failureCount: isNull(failureCount)
            ? noDataSymbol : $t(intlFormats.countFormat, { value: failureCount }),
          successPercentage,
          averageTtc: isNull(averageTtc)
            ? noDataSymbol : formatter('durationFormat')(averageTtc) as string
        }
      }
    }
  })

  const mapping: BoxProps[] = [
    {
      type: 'successCount',
      title: defineMessage({ defaultMessage: 'Successful Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      isOpen: openType === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.successCount,
      toggleEnable
    },
    {
      type: 'failureCount',
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      isOpen: openType === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.failureCount,
      toggleEnable
    },
    {
      type: 'successPercentage',
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
      isOpen: openType === 'connectionFailure',
      onClick: toggleConnectionFailure,
      value: queryResults.data.successPercentage,
      toggleEnable
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg Time To Connect' }),
      isOpen: openType === 'ttc',
      onClick: toggleTtc,
      value: queryResults.data.averageTtc,
      toggleEnable
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
