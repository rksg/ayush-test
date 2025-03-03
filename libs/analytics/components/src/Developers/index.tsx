import { Tabs }                                               from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission }                                      from '@acx-ui/user'

import { useApplicationTokens } from './ApplicationTokens'
import { useWebhooks }          from './Webhooks'

export function DevelopersTab () {
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const basePath = useTenantLink('/analytics/admin/developers')

  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabs = [{
    key: 'applicationTokens',
    canAccess: true,
    ...useApplicationTokens()
  }, {
    key: 'webhooks',
    canAccess: hasPermission({ permission: 'READ_WEBHOOKS' }),
    ...useWebhooks()
  }].filter(tab => tab.canAccess)

  return <Tabs
    onChange={onTabChange}
    destroyInactiveTabPane
    activeKey={activeSubTab}
    defaultActiveKey='applicationTokens'
    type='card'
  >
    {tabs.map(tab => <Tabs.TabPane
      key={tab.key}
      tab={tab.title}
      children={tab.component}
    />)}
  </Tabs>
}
