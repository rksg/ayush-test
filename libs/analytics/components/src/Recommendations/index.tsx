import { useIntl } from 'react-intl'

import { useAnalyticsFilter }                      from '@acx-ui/analytics/utils'
import { GridRow, GridCol, Tabs }                  from '@acx-ui/components'
import { useTenantLink, useNavigate, useLocation } from '@acx-ui/react-router-dom'

import { RecommendationTable } from '../Recommendations/table'

export enum RecommendationTabEnum {
  CRRM = 'crrm',
  AIOPS = 'aiOps'
}

interface Tab {
  key: RecommendationTabEnum,
  title: string,
  component: JSX.Element
}

const useTabs = (): Tab[] => {
  const { $t } = useIntl()
  const { filters } = useAnalyticsFilter()
  const crrmTab = {
    key: RecommendationTabEnum.CRRM,
    title: $t({ defaultMessage: 'Cloud RRM' }),
    component: <RecommendationTable filters={filters} showCrrm />
  }
  const aiOps = {
    key: RecommendationTabEnum.AIOPS,
    title: $t({ defaultMessage: 'AI Operations' }),
    component: <RecommendationTable filters={filters} showCrrm={false} />
  }
  return [
    crrmTab,
    aiOps
  ]
}

export const RecommendationTabContent = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/recommendations')
  const location = useLocation()
  const tab = location.pathname.includes('crrm') ? 'crrm' : 'aiOps'
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        {tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>}
        {TabComp}
      </GridCol>
    </GridRow>
  )
}
