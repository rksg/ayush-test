import { useIntl } from 'react-intl'

import { PageHeader, Tabs, TimeRangeDropDownProvider } from '@acx-ui/components'
import { get }                                         from '@acx-ui/config'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { getShowWithoutRbacCheckKey, hasPermission }   from '@acx-ui/user'
import { DateRange }                                   from '@acx-ui/utils'

import { useHeaderExtra }           from '../Header'
import { Filter }                   from '../Header/Header'
import { IncidentTabContent }       from '../Incidents'
import { IntentAITabContent }       from '../IntentAI'
import { RecommendationTabContent } from '../Recommendations'

export enum AIAnalyticsTabEnum {
  INCIDENTS = 'incidents',
  CRRM = 'recommendations/crrm',
  AIOPS = 'recommendations/aiOps',
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
  const crrmTab = {
    key: AIAnalyticsTabEnum.CRRM,
    title: $t({ defaultMessage: 'AI-Driven RRM' }),
    component: <RecommendationTabContent />,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: true, datepicker: 'dropdown' })
  }

  const aiOpsTab = {
    key: AIAnalyticsTabEnum.AIOPS,
    title: $t({ defaultMessage: 'AI Operations' }),
    component: <RecommendationTabContent />,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: true, datepicker: 'dropdown' })
  }

  const intentAITab = {
    key: AIAnalyticsTabEnum.INTENTAI,
    title: $t({ defaultMessage: 'IntentAI' }),
    component: <IntentAITabContent />,
    headerExtra: [<Filter key={getShowWithoutRbacCheckKey('network-filter')} />]
  }

  const getRecommendationTabs = () => {
    let recommendationTabs = [] as Tab[]
    if (get('IS_MLISA_SA')) { // RAI
      if (hasPermission({ permission: 'READ_AI_DRIVEN_RRM' })) {
        recommendationTabs.push(crrmTab as Tab)
      }
      if (hasPermission({ permission: 'READ_AI_OPERATIONS' })) {
        recommendationTabs.push(aiOpsTab as Tab)
      }
    } else { // R1
      recommendationTabs.push(crrmTab as Tab)
      recommendationTabs.push(aiOpsTab as Tab)
    }
    return recommendationTabs
  }
  const getIntentAItab = () => {
    const intentTab = []
    if (get('IS_MLISA_SA')) { // RAI
      hasPermission({ permission: 'READ_INTENT_AI' }) && intentTab.push(intentAITab as Tab)
    } else { // R1
      intentTab.push(intentAITab as Tab)
    }
    return intentTab
  }
  const isIntentAIEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_INTENT_AI_TOGGLE),
    useIsSplitOn(Features.INTENT_AI_TOGGLE)
  ].some(Boolean)

  return [
    incidentsTab,
    ...(isIntentAIEnabled ? getIntentAItab() : getRecommendationTabs())
  ]
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
