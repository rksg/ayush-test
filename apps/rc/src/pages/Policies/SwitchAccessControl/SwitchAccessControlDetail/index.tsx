
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import AccessControlOverview from './AccessControlOverview'
import AccessControlRules    from './AccessControlRules'

const AccessControlDetailTabs = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { accessControlId } = useParams()
  const basePath = useTenantLink('/policies/accessControl/switch')

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${accessControlId}/${tab}`
    }, { replace: true })
  }
  return (
    <Tabs type='card' onChange={onTabChange} activeKey='overview'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Rules' })}
        key='rules' />
    </Tabs>
  )
}

const tabs = {
  overview: () => <AccessControlOverview />,
  rules: () => <AccessControlRules />
}

export function SwitchAccessControlDetail () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]

  return (
    <>
      <AccessControlDetailTabs />
      { Tab && <Tab /> }
    </>
  )
}
