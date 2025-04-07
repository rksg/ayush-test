import { useIntl } from 'react-intl'

import { PageHeader, Tabs, TimeRangeDropDownProvider } from '@acx-ui/components'
import { get }                                         from '@acx-ui/config'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { getShowWithoutRbacCheckKey, hasPermission }   from '@acx-ui/user'
import { DateRange }                                   from '@acx-ui/utils'

import { useHeaderExtra }     from '../Header'
import { Filter }             from '../Header/Header'
import { IncidentTabContent } from '../Incidents'
import { IntentAITabContent } from '../IntentAI'

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
  const intentAITab = {
    key: AIAnalyticsTabEnum.INTENTAI,
    title: $t({ defaultMessage: 'IntentAI' }),
    component: <IntentAITabContent />,
    headerExtra: [<Filter key={getShowWithoutRbacCheckKey('network-filter')} />]
  }
  const tabs = [incidentsTab]
  get('IS_MLISA_SA')
    ? hasPermission({ permission: 'READ_INTENT_AI' }) && tabs.push(intentAITab)
    : tabs.push(intentAITab)
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
