import { useState } from 'react'

import { isNull }                                    from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { useAnalyticsFilter }       from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Loader } from '@acx-ui/components'
import { intlFormats }              from '@acx-ui/utils'

import { useSummaryQuery }  from './services'
import { getBoxComponents } from './styledComponents'

interface BoxProps {
  type: string,
  title: MessageDescriptor
  value: string
  suffix: boolean,
  suffixValue: string|undefined,
  isOpen: boolean,
  onClick: () => void
}

const Box = (props: BoxProps) => {
  const { $t } = useIntl()
  const { Wrapper, Statistic, UpArrow, DownArrow } = getBoxComponents(props.type)
  return (
    <Wrapper onClick={props.onClick}>
      <Statistic
        title={$t(props.title)}
        value={props.value}
        suffix={props.suffixValue}
      />
      {props.isOpen ? <UpArrow/> : <DownArrow/>}
    </Wrapper>
  )
}

const SummaryBoxes = () => {
  const { $t } = useIntl()
  const [ isOpen, setIsOpen ] = useState(false)
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
    },
    {
      type: 'averageTtc',
      title: defineMessage({ defaultMessage: 'Avg. Time to Connect' })
    }
  ] as BoxProps[]

  return (
    <Loader states={[queryResults]}>
      <GridRow>{
        mapping.map((box: BoxProps)=>
          <GridCol key={box.type} col={{ span: 6 }}>
            <Box
              {...box}
              isOpen={isOpen}
              onClick={()=>{ setIsOpen(!isOpen)}}
              value={queryResults.data[box.type as keyof typeof queryResults.data]}
              suffixValue={box.suffix?`/${queryResults.data.totalCount}`:undefined}
            />
          </GridCol>
        )}
      </GridRow>
    </Loader>
  )
}

export default SummaryBoxes