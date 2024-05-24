
import { FormattedMessage } from 'react-intl'

import { useAnalyticsFilter }      from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Alert } from '@acx-ui/components'
import type { AnalyticsFilter }    from '@acx-ui/utils'

import { ConnectedClientsOverTime } from './ConnectedClientsOverTime'
import { SummaryBoxes }             from './SummaryBoxes'

const OverviewTab = (props: { filters? : AnalyticsFilter, wirelessOnly?: boolean }) => {
  const { filters: widgetFilters, wirelessOnly = false } = props
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters
  const switchFirmwareVersionMsg = <FormattedMessage
    defaultMessage={
      'Data is displayed for switches with firmware version <b>10.0.10c</b> or above.'
    }
    values={{
      b: (content) => <b >{content}</b>
    }}
  />

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <Alert message={switchFirmwareVersionMsg} type='info' showIcon/>
        <SummaryBoxes
          filters={healthPageFilters}
          wirelessOnly={wirelessOnly}
        />
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ minHeight: '320px' }}>
        <ConnectedClientsOverTime filters={healthPageFilters} />
      </GridCol>
    </GridRow>
  )
}
export { OverviewTab }
