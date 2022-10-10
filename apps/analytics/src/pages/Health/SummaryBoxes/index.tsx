import { useState } from 'react'

import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { noDataSymbol, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader }         from '@acx-ui/components'
import { formatter, intlFormats }           from '@acx-ui/utils'

import { useSummaryQuery }                        from './services'
import { Wrapper, Statistic, UpArrow, DownArrow } from './styledComponents'

interface BoxProps {
  type: string,
  title: MessageDescriptor
  value: string
  suffix?: string,
  isOpen: boolean,
  onClick: () => void
}

const Box = (props: BoxProps) => {
  const { $t } = useIntl()
  return (
    <Wrapper $type={props.type} onClick={props.onClick}>
      <Statistic
        $type={props.type}
        title={$t(props.title)}
        value={props.value}
        suffix={props.suffix}
      />
      {props.isOpen ? <UpArrow $type={props.type}/> : <DownArrow $type={props.type}/>}
    </Wrapper>
  )
}

export const SummaryBoxes = () => {
  const intl = useIntl()
  const { $t } = intl
  const [ openType, setOpenType ] = useState<'stats' | 'ttc' | 'none'>('none')
  const { filters } = useAnalyticsFilter()
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }

  const toggleStats = () => setOpenType(openType !== 'stats' ? 'stats' : 'none')
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
      isOpen: openType === 'stats',
      onClick: toggleStats,
      value: queryResults.data.successCount
    },
    {
      type: 'failureCount',
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      isOpen: openType === 'stats',
      onClick: toggleStats,
      value: queryResults.data.failureCount
    },
    {
      type: 'successPercentage',
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
      isOpen: openType === 'stats',
      onClick: toggleStats,
      value: queryResults.data.successPercentage
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg. Time To Connect' }),
      isOpen: openType === 'ttc',
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
