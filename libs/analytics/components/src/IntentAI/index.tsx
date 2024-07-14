import { useAnalyticsFilter }             from '@acx-ui/analytics/utils'
import { GridRow, GridCol, useDateRange } from '@acx-ui/components'
import { getDateRangeFilter }             from '@acx-ui/utils'

import { IntentAITable } from './Table'

export const IntentAITabContent = () => {
  const { pathFilters } = useAnalyticsFilter()
  const { selectedRange } = useDateRange()

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <IntentAITable
          pathFilters={{ ...pathFilters, ...getDateRangeFilter(selectedRange) }}
        />
      </GridCol>
    </GridRow>
  )
}
