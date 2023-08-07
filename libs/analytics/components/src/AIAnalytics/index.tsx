import { useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { get }                                   from '@acx-ui/config'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                        from '@acx-ui/user'

import { useConfigChange }          from '../ConfigChange'
import { useHeaderExtra }           from '../Header'
import { IncidentTabContent }       from '../Incidents'
import { RecommendationTabContent } from '../Recommendations'

export enum AIAnalyticsTabEnum {
  INCIDENTS = 'incidents',
  CONFIG_CHANGE = 'configChange',
  CRRM = 'recommendations/crrm',
  AIOPS = 'recommendations/aiOps'
}

interface Tab {
  key: AIAnalyticsTabEnum,
  title: string,
  component: JSX.Element,
  headerExtra?: JSX.Element[]
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const configChangeEnable = useIsSplitOn(Features.CONFIG_CHANGE)
  const recommendationsEnabled = useIsSplitOn(Features.AI_RECOMMENDATIONS)
  const incidentsTab = {
    key: AIAnalyticsTabEnum.INCIDENTS,
    title: $t({ defaultMessage: 'Incidents' }),
    component: <IncidentTabContent/>,
    headerExtra: useHeaderExtra({ shouldQuerySwitch: true, withIncidents: true })
  }
  const configChangeTab = {
    key: AIAnalyticsTabEnum.CONFIG_CHANGE,
    title: $t({ defaultMessage: 'Config Change' }),
    ...useConfigChange()
  }
  const recommendationTab = [
    {
      key: AIAnalyticsTabEnum.CRRM,
      title: $t({ defaultMessage: 'AI-Driven RRM' }),
      component: <RecommendationTabContent />,
      headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
    },
    {
      key: AIAnalyticsTabEnum.AIOPS,
      title: $t({ defaultMessage: 'AI Operations' }),
      component: <RecommendationTabContent />,
      headerExtra: useHeaderExtra({ excludeNetworkFilter: true })
    }
  ]
  return [
    incidentsTab,
    ...(get('IS_MLISA_SA') || recommendationsEnabled ? recommendationTab : []),
    ...(get('IS_MLISA_SA') || configChangeEnable ? [configChangeTab] : [])
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
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'AI Analytics' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'AI Assurance' }) }]}
      footer={
        tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>
      }
      extra={get('IS_MLISA_SA')
        ? tabs.find(({ key }) => key === tab)?.headerExtra
        : filterByAccess(tabs.find(({ key }) => key === tab)?.headerExtra)}
    />
    {TabComp}
  </>
}
