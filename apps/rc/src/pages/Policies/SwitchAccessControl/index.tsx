import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useSwitchAclTotalCount }                from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchAccessControlSet } from './SwitchAccessControlSet'
import { SwitchLayer2ACL }        from './SwitchLayer2/SwitchLayer2ACL'

export function SwitchAccessControl () {
  const { activeSubTab } = useParams()

  const AccessControlTabs = () => {
    const { $t } = useIntl()
    const navigate = useNavigate()
    const basePath = useTenantLink('/policies/accessControl/switch')
    const { switchMacAclCount, switchL2AclCount } = useSwitchAclTotalCount(false)

    const onCategoryTabChange = (tab: string) => {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${tab}`
      })
    }

    return (
      <Tabs
        type='card'
        activeKey={activeSubTab}
        onChange={onCategoryTabChange}
        defaultActiveKey='list'>
        <Tabs.TabPane
          tab={$t({
            defaultMessage: 'Access Control Set ({count})' }, { count: switchMacAclCount })}
          key='list' />
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Layer 2 ({count})' }, { count: switchL2AclCount })}
          key='layer2' />
      </Tabs>
    )
  }

  const tabs = {
    list: () => <SwitchAccessControlSet />,
    layer2: () => <SwitchLayer2ACL />
  }

  const Tab = tabs[(activeSubTab || 'list') as keyof typeof tabs]

  return (
    <>
      <AccessControlTabs />
      { Tab && <Tab /> }
    </>
  )
}
