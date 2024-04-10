
import { useAnalyticsFilter }   from '@acx-ui/analytics/utils'
import { GridCol, GridRow }     from '@acx-ui/components'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { SummaryBoxes } from './SummaryBoxes'

const OverviewTab = (props: { filters? : AnalyticsFilter, wirelessOnly?: boolean }) => {
  const { filters: widgetFilters, wirelessOnly = false } = props
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <SummaryBoxes
          filters={healthPageFilters}
          wirelessOnly={wirelessOnly}
        />
      </GridCol>
    </GridRow>
  )
}
export { OverviewTab }
