import { useAnalyticsFilter }   from '@acx-ui/analytics/utils'
import { GridRow, GridCol }     from '@acx-ui/components'
import { useRaiR1HelpPageLink } from '@acx-ui/rc/utils'

import * as UI           from './styledComponents'
import { IntentAITable } from './Table'

const IntentAITabContent = () => {
  const { pathFilters } = useAnalyticsFilter()
  //Get URL here to avoid triggering many times in the banner component
  const helpUrl = useRaiR1HelpPageLink()

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <UI.ApplyModalStyle />
        <IntentAITable
          pathFilters={pathFilters}
          helpUrl={helpUrl}
        />
      </GridCol>
    </GridRow>
  )
}

export default IntentAITabContent
