import { useIntl } from 'react-intl'

import { useAnalyticsFilter, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol, PageHeader, RangePicker }                    from '@acx-ui/components'
import { useDateFilter }                            from '@acx-ui/utils'

import { RecommendationTable }      from '../Recommendations/table'
import moment from 'moment-timezone'

export const RecommendationTabContent = () => {
  const { filters } = useAnalyticsFilter()
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <RecommendationTable filters={filters} />
      </GridCol>
    </GridRow>
  )
}

export function Recommendations () {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return (<>
    <PageHeader
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) }
      ]}
      title={$t({ defaultMessage: 'AI Analytics' })}
      extra={[<RangePicker
        key='range-picker'
        selectedRange={{
          startDate: moment(startDate),
          endDate: moment(endDate)
        }}
        onDateApply={setDateFilter as CallableFunction}
        showTimePicker
        selectionType={range}
      />]}
    />
    <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
      <RecommendationTable filters={filters} /> 
    </GridCol>
  </>)
}
