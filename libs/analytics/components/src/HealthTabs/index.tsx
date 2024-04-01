import { useIntl } from 'react-intl'

import { Tabs }                                               from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { HealthPage } from '..'

import { OverviewTab } from './OverviewTab'

export function HealthTabs () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const basePath = useTenantLink('/analytics/health/')

  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='overview'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview'>
      <OverviewTab/>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless'>
      <HealthPage />
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wired' })} key='wired'>
      <div>
        Health Wired Page
      </div>
    </Tabs.TabPane>
  </Tabs>
}
