
import { FormattedMessage } from 'react-intl'

import { useAnalyticsFilter }      from '@acx-ui/analytics/utils'
import { GridCol, GridRow, Alert } from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import type { AnalyticsFilter }    from '@acx-ui/utils'

import { ConnectedClientsOverTime } from './ConnectedClientsOverTime'
import { SummaryBoxes }             from './SummaryBoxes'

const OverviewTab = (props: { filters? : AnalyticsFilter, wirelessOnly?: boolean }) => {
  const { filters: widgetFilters, wirelessOnly = false } = props
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = widgetFilters ? widgetFilters : filters
  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)
  const switchFirmwareVersionMsg = get('IS_MLISA_SA') ?
    <FormattedMessage
      defaultMessage={
        'For Wired Health metrics – you are recommended to ensure switches have a ' +
        'pre-requisite firmware version of <b>{switchFmwrVersion}</b> and SmartZone version ' +
        '<b>7.x</b> or above at minimum. Select compliance metrics may need higher ' +
        'firmware levels.'
      }
      values={{
        switchFmwrVersion: isSwitchHealth10010eEnabled ? '10.0.10f' : '10.0.10d',
        b: (content) => <b >{content}</b>
      }}
    />
    :
    <FormattedMessage
      defaultMessage={
        'For Wired Health metrics – you are recommended to ensure switches have a ' +
        'pre-requisite firmware version of <b>{switchFmwrVersion}</b> or above at minimum. ' +
        'Select compliance metrics may need higher firmware levels.'
      }
      values={{
        switchFmwrVersion: isSwitchHealth10010eEnabled ? '10.0.10f' : '10.0.10d',
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
