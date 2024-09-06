import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { GridRow, GridCol }   from '@acx-ui/components'

import * as UI           from './styledComponents'
import { IntentAITable } from './Table'

export const IntentAITabContent = () => {
  const { pathFilters } = useAnalyticsFilter()

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <UI.ApplyModalStyle />
        <IntentAITable
          pathFilters={{ ...pathFilters }}
        />
      </GridCol>
    </GridRow>
  )
}
