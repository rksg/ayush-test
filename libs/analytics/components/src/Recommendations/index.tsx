import { useAnalyticsFilter }             from '@acx-ui/analytics/utils'
import { GridRow, GridCol, useDateRange } from '@acx-ui/components'
import { useParams }                      from '@acx-ui/react-router-dom'
import { getDateRangeFilter }             from '@acx-ui/utils'

import { RecommendationTable } from '../Recommendations/Table'

export const RecommendationTabContent = () => {
  const { pathFilters } = useAnalyticsFilter()
  const { selectedRange } = useDateRange()
  const params = useParams()
  const showCrrm = params['activeTab'] === 'crrm'
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <RecommendationTable
          pathFilters={{ ...pathFilters, ...getDateRangeFilter(selectedRange) }}
          showCrrm={showCrrm}
          key={String(showCrrm)}
        />
      </GridCol>
    </GridRow>
  )
}
