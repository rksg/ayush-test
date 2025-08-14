import moment                        from 'moment'
import { useIntl, FormattedMessage } from 'react-intl'

import { useAnalyticsFilter, categoryTabs, CategoryTab } from '@acx-ui/analytics/utils'
import { Alert, GridCol, GridRow, Tabs }                 from '@acx-ui/components'
import { get }                                           from '@acx-ui/config'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }         from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                          from '@acx-ui/utils'

import { HealthPageContextProvider } from '../../Health/HealthPageContext'
import * as UI                       from '../../Health/styledComponents'

import Kpis             from './Kpi'
import { SummaryBoxes } from './SummaryBoxes'

const WiredTab = (props: { filters?: AnalyticsFilter, path?: string, noSwitches?: boolean }) => {
  const { $t } = useIntl()
  const { filters: widgetFilters, noSwitches } = props
  const { filters } = useAnalyticsFilter()
  const healthPageFilters = {
    ...filters,
    ...widgetFilters,
    startDate: moment(widgetFilters?.startDate || filters.startDate).tz('UTC').format(),
    endDate: moment(widgetFilters?.endDate || filters.endDate).tz('UTC').format()
  }

  const params = useParams()
  const selectedTab = params['categoryTab'] ?? categoryTabs[0].value
  const navigate = useNavigate()
  const basePath = useTenantLink(props.path ?? '/analytics/health/wired/tab/')
  const isSwitchHealth10010eEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_SWITCH_HEALTH_10010E_TOGGLE),
    useIsSplitOn(Features.SWITCH_HEALTH_10010E_TOGGLE)
  ].some(Boolean)
  const baseMessage = 'For Wired Health metrics – you are recommended to ensure switches have a ' +
    'pre-requisite firmware version of <b>{switchFmwrVersion}</b>'
  const mlisaSuffix = ' and SmartZone version <b>7.x</b> or above at minimum. ' +
    'Select compliance metrics may need higher firmware levels.'
  const nonMlisaSuffix = ' or above at minimum. Select compliance metrics may need higher ' +
    'firmware levels.'

  const switchFirmwareVersionMsg = get('IS_MLISA_SA') ?
    <FormattedMessage
      defaultMessage={baseMessage + mlisaSuffix}
      values={{
        switchFmwrVersion: isSwitchHealth10010eEnabled ? '10.0.10f' : '10.0.10d',
        b: (content) => <b >{content}</b>
      }}
    />
    :
    <FormattedMessage
      defaultMessage={baseMessage + nonMlisaSuffix}
      values={{
        switchFmwrVersion: isSwitchHealth10010eEnabled ? '10.0.10f' : '10.0.10d',
        b: (content) => <b >{content}</b>
      }}
    />

  const onTabChange = (tab: string) => {
    // Clear infrastructure KPI tab persistence when clicking on infrastructure tab
    // This ensures it always defaults to "System" when navigating to infrastructure
    if (tab === 'infrastructure') {
      localStorage.removeItem('health-infrastructure-kpi-content-switcher')
    }

    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '105px' }}>
        <Alert message={switchFirmwareVersionMsg} type='info' showIcon/>
        <SummaryBoxes
          filters={healthPageFilters}
          noSwitches={noSwitches}
        />
      </GridCol>
      <HealthPageContextProvider>
        <GridCol col={{ span: 16 }}>
          <UI.TabTitle activeKey={selectedTab} onChange={onTabChange}>
            {categoryTabs.map(({ value, label }) => (
              <Tabs.TabPane tab={$t(label)} key={value} />
            ))}
          </UI.TabTitle>
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <UI.ThresholdTitle>
            {$t({ defaultMessage: 'Customized SLA Threshold' })}
          </UI.ThresholdTitle>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <Kpis tab={selectedTab as CategoryTab} filters={healthPageFilters}/>
        </GridCol>
      </HealthPageContextProvider>
    </GridRow>
  )
}
export { WiredTab }
