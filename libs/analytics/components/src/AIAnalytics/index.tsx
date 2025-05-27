import { useIntl } from 'react-intl'

import { useGetTenantSettingsQuery }                           from '@acx-ui/analytics/services'
import { Loader, PageHeader, Tabs, TimeRangeDropDownProvider } from '@acx-ui/components'
import { get }                                                 from '@acx-ui/config'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }               from '@acx-ui/react-router-dom'
import { getShowWithoutRbacCheckKey, hasPermission }           from '@acx-ui/user'
import { DateRange }                                           from '@acx-ui/utils'

import { useHeaderExtra }     from '../Header'
import { Filter }             from '../Header/Header'
import { IncidentTabContent } from '../Incidents'
import { IntentAITabContent } from '../IntentAI'
import { Settings }           from '../IntentAI/Settings'


export enum AIAnalyticsTabEnum {
  INCIDENTS = 'incidents',
  INTENTAI = 'intentAI'
}

interface Tab {
  key: AIAnalyticsTabEnum,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const incidentsTab = {
    key: AIAnalyticsTabEnum.INCIDENTS,
    title: $t({ defaultMessage: 'Incidents' }),
    component: <IncidentTabContent/>,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: true, withIncidents: true })
  }
  const tabs = [incidentsTab]
  const isIntentAITabVisisble = get('IS_MLISA_SA')
    ? hasPermission({ permission: 'READ_INTENT_AI' })
    : true

  const isIntentSettingsVisible = [
    useIsSplitOn(Features.RUCKUS_AI_ENERGY_SAVING_TOGGLE),
    useIsSplitOn(Features.ACX_UI_ENERGY_SAVING_TOGGLE)
  ].some(Boolean) && (
    get('IS_MLISA_SA')
      ? hasPermission({ permission: 'WRITE_INTENT_AI' })
      : true
  )
  const settingsQuery = useGetTenantSettingsQuery(
    undefined,
    {
      skip: !isIntentSettingsVisible
    }
  )
  const tenantSettings = settingsQuery.data?.['enabled-intent-features'] ?? '[]'
  const intentTabHeaderExtra = [
    <Filter key={getShowWithoutRbacCheckKey('network-filter')} />
  ]
  if (isIntentSettingsVisible) {
    intentTabHeaderExtra.push(<Loader states={[settingsQuery]}>
      <Settings settings={tenantSettings as string}/>
    </Loader>)
  }
  const intentAITab = {
    key: AIAnalyticsTabEnum.INTENTAI,
    title: $t({ defaultMessage: 'IntentAI' }),
    component: <IntentAITabContent />,
    headerExtra: intentTabHeaderExtra
  }

  isIntentAITabVisisble && tabs.push(intentAITab)
  return tabs
}

export function AIAnalytics ({ tab }:{ tab?: AIAnalyticsTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const { activeTab } = useParams()
  const tabEnumKey = activeTab?.toUpperCase() as string
  if (!tab) {
    tab = AIAnalyticsTabEnum[tabEnumKey as keyof typeof AIAnalyticsTabEnum]
  }
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <TimeRangeDropDownProvider availableRanges={[
    DateRange.last7Days,
    DateRange.last30Days
  ]}>
    <PageHeader
      title={$t({ defaultMessage: 'AI Analytics' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'AI Assurance' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={tabs.find(({ key }) => key === tab)?.headerExtra}
    />
    {TabComp}
  </TimeRangeDropDownProvider>
}
