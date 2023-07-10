import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }   from '@acx-ui/components'

import { RecommendationTable } from '../Recommendations/table'

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
