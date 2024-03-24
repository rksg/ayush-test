import { useIntl } from 'react-intl'

import { Tabs }                                from '@acx-ui/components'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { HealthPage } from '..'

export function HealthTabs () {
  const { $t } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSubTab } = useParams()
  const onTabChange = (tab: string) => {
    navigate({
      ...location,
      pathname: activeSubTab
        ? location.pathname.replace(activeSubTab as string, tab)
        : `${location.pathname}/${tab}`
    })
  }
  return <Tabs
    onChange={onTabChange}
    activeKey={activeSubTab}
    defaultActiveKey='overview'
    type='card'
  >
    <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview'>
      <div>
        Health Overview Page
      </div>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wireless' })} key='wireless'>
      <HealthPage path='/health/wireless/tab/'/>
    </Tabs.TabPane>
    <Tabs.TabPane tab={$t({ defaultMessage: 'Wired' })} key='wired'>
      <div>
        Health Wired Page
      </div>
    </Tabs.TabPane>
  </Tabs>
}
