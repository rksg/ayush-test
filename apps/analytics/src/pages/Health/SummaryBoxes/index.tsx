import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { useAnalyticsFilter }       from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { intlFormats }              from '@acx-ui/utils'

import { useSummaryQuery } from './services'
import { Statistic }       from './styledComponents'

interface BoxProps {
  type: string,
  title: MessageDescriptor
  suffix: boolean,
  suffixValue: string,
}
const SummaryBoxes = () => {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const payload = {
    path: filters.path,
    start: filters.startDate,
    end: filters.endDate
  }
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
        : '-'
      const failureCount = !isNull(totalCount) && !isNull(successCount)
        ? totalCount - successCount
        : null

      return {
        ...rest,
        data: {
          totalCount: isNull(totalCount)
            ? '-' : $t(intlFormats.countFormat, { value: totalCount }),
          successCount: isNull(successCount)
            ? '-' : $t(intlFormats.countFormat, { value: successCount }),
          failureCount: isNull(failureCount)
            ? '-' : $t(intlFormats.countFormat, { value: failureCount }),
          successPercentage,
          averageTtc: isNull(averageTtc)
            ? '-' : $t(intlFormats.countFormat, { value: averageTtc }) //todo
        }
      }
    }
  })

  const mapping = [
    {
      type: 'successCount',
      title: defineMessage({ defaultMessage: 'Successful Connections' }),
      suffix: true
    },
    {
      type: 'failureCount',
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      suffix: true
    },
    {
      type: 'successPercentage',
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' })
      // suffix
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg. Time to Connect' })
      // suffix
    }
  ] as BoxProps[]

  return (
    <Loader states={[queryResults]}>
      <GridRow>{
        mapping.map((box: BoxProps)=>
          <GridCol col={{ span: 6 }}>
            <Statistic
              title={$t(box.title)}
              value={queryResults.data[box.type as keyof typeof queryResults.data]}
              suffix={box.suffix?`/${queryResults.data.totalCount}`:undefined}
            />
          </GridCol>
        )}
      </GridRow>
    </Loader>
  )
}

export default SummaryBoxes