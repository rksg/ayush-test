// import { useIntl } from 'react-intl'

import { Tabs }                                               from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { useWebhooks } from '../Webhooks'

import { useApplicationTokens } from './ApplicationTokens'

export function DevelopersTab () {
  // const { $t } = useIntl()
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

  const { title: webhookTitle, component: webhookComponent } = useWebhooks()
  const {
    title: applicationTokenTitle,
    component: applicationTokenComponent } = useApplicationTokens()

  return <Tabs
    onChange={onTabChange}
    destroyInactiveTabPane
    activeKey={activeSubTab}
    defaultActiveKey='applicationTokens'
    type='card'
  >
    <Tabs.TabPane tab={applicationTokenTitle} key='applicationTokens'>
      {applicationTokenComponent}
    </Tabs.TabPane>
    <Tabs.TabPane tab={webhookTitle} key='webhooks'>
      {webhookComponent}
    </Tabs.TabPane>
  </Tabs>
}
