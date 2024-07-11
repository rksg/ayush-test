import { useAnalyticsFilter }             from '@acx-ui/analytics/utils'
import { GridRow, GridCol, useDateRange } from '@acx-ui/components'
import { getDateRangeFilter }             from '@acx-ui/utils'

import { IntentAIRecommendationTable } from './Table'

export const IntentAIRecommendationTabContent = () => {
  const { pathFilters } = useAnalyticsFilter()
  const { selectedRange } = useDateRange()

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <IntentAIRecommendationTable
          pathFilters={{ ...pathFilters, ...getDateRangeFilter(selectedRange) }}
        />
      </GridCol>
    </GridRow>
  )
}
