import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }   from '@acx-ui/components'
import { useParams }          from '@acx-ui/react-router-dom'

import { RecommendationTable } from '../Recommendations/table'

export const RecommendationTabContent = () => {
  const { filters } = useAnalyticsFilter()
  const params = useParams()
  const showCrrm = params['activeTab'] === 'crrm'
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <RecommendationTable filters={filters} showCrrm={showCrrm} />
      </GridCol>
    </GridRow>
  )
}
