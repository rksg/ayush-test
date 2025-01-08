import { useIntl } from 'react-intl'

import { GridRow, GridCol, Banner } from '@acx-ui/components'
import { useRaiR1HelpPageLink }     from '@acx-ui/rc/utils'

const DataSubscriptionsContent = () => {
  const { $t } = useIntl()
  const helpUrl = useRaiR1HelpPageLink()
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <Banner
          title={$t({ defaultMessage: 'Simplify Data Integration' })}
          subTitles={[$t({
            defaultMessage: `Seamlessly transfer data between RUCKUS AI 
            ans cloud platforms, monitor usage with precision, `
          }), $t({ defaultMessage: 'and customize exports for enhanced business insights.' })]}
          helpUrl={helpUrl}
          closable />
      </GridCol>
    </GridRow>
  )
}

export default DataSubscriptionsContent