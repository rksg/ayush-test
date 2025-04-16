import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useAccessControlsCountQuery }           from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchAccessControlSet } from './SwitchAccessControlSet'
import { SwitchLayer2ACL }        from './SwitchLayer2/SwitchLayer2ACL'

export function SwitchAccessControl () {
  const { activeSubTab } = useParams()

  const AccessControlTabs = () => {
    const { $t } = useIntl()
    const params = useParams()
    const navigate = useNavigate()
    const basePath = useTenantLink('/policies/accessControl/switch')
    const accessControlCount = useAccessControlsCountQuery({ params }).data?.toString() || '0'

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
            defaultMessage: 'Access Control Set ({accessControlCount})' }, { accessControlCount })}
          key='list' />
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Layer 2' })}
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
