import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { AnalyticsFilter }          from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { formatter, intlFormats }   from '@acx-ui/formatter'
import { noDataDisplay }            from '@acx-ui/utils'

import { useSummaryQuery }    from './services'
import { Wrapper, Statistic } from './styledComponents'

interface BoxProps {
  type: string,
  title: MessageDescriptor
  value: string
  suffix?: string
  // TODO: post GA
  // isOpen: boolean
  // onClick: () => void
}

export const Box = (props: BoxProps) => {
  const { $t } = useIntl()
  const box = <Wrapper
    $type={props.type}
    // TODO: post GA
    // onClick={props.onClick}
  >
    <Statistic
      $type={props.type}
      title={$t(props.title)}
      value={props.value}
      suffix={props.suffix}
    />
    {/* TODO: post GA, hide for now */}
    {/* {props.isOpen ? <UpArrow $type={props.type}/> : <DownArrow $type={props.type}/>} */}
  </Wrapper>
  return box
}

export const SummaryBoxes = ({ filters }: { filters: AnalyticsFilter }) => {
  const intl = useIntl()
  const { $t } = intl
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }

  // TODO: post GA
  // const [ openType, setOpenType ] = useState<'stats' | 'ttc' | 'none'>('none')
  // const toggleStats = () => setOpenType(openType !== 'stats' ? 'stats' : 'none')
  // const toggleTtc = () => setOpenType(openType !== 'ttc' ? 'ttc' : 'none')

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
      // isOpen: openType === 'stats',
      // onClick: toggleStats,  TODO: post GA
      value: queryResults.data.successCount
    },
    {
      type: 'failureCount',
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      suffix: `/${queryResults.data.totalCount}`,
      // isOpen: openType === 'stats',
      // onClick: toggleStats,  // TODO: post GA
      value: queryResults.data.failureCount
    },
    {
      type: 'successPercentage',
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
      // isOpen: openType === 'stats',
      // onClick: toggleStats,  // TODO: post GA
      value: queryResults.data.successPercentage
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg Time To Connect' }),
      // isOpen: openType === 'ttc',
      // onClick: toggleTtc,  // TODO: post GA
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
